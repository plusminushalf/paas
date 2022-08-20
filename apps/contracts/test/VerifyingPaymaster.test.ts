import { expect } from "chai";
import "@nomicfoundation/hardhat-toolbox";
import { ethers } from "hardhat";
import { SingletonFactory } from "./types/SingletonFactoryInterface.types";
import {
  BigNumber,
  BytesLike,
  Contract,
  ContractFactory,
  Signer,
} from "ethers";
import { DepositInfo, EntryPoint } from "./types/EntryPoint.types";
import { VerifyingPaymaster } from "./types/VerifyingPaymaster.types";
import { Result } from "@ethersproject/abi";

const DEPOSIT_AMOUNT = ethers.utils.parseEther("1");
const WITHDRAW_AMOUNT = ethers.utils.parseEther("0.5");
const STAKE_AMOUNT = ethers.utils.parseEther("1");
const UNSTAKE_DELAY_SEC: number = 1;

async function deploySingletonFactory(): Promise<SingletonFactory> {
  const SingletonFactoryContractFactory: ContractFactory =
    await ethers.getContractFactory("SingletonFactory");
  const singletonFactory: SingletonFactory =
    (await SingletonFactoryContractFactory.deploy()) as SingletonFactory;
  return singletonFactory;
}

async function deployFromSingletonFactory(
  factory: SingletonFactory,
  name: string,
  bytecode: BytesLike | undefined,
  salt: string
): Promise<Contract> {
  const address: string = await factory.computeAddress(bytecode, salt);
  const tx: Result = await factory.deployContract(bytecode, salt, {
    gasLimit: 30000000,
  });
  await tx.wait();
  return ethers.getContractAt(name, address);
}

async function deployEntryPointContract(
  singletonFactory: SingletonFactory
): Promise<EntryPoint> {
  const entryPointContractFactory: ContractFactory =
    await ethers.getContractFactory("TestEntryPoint");

  const entryPointBytecode: BytesLike | undefined =
    entryPointContractFactory.getDeployTransaction(
      singletonFactory.address,
      STAKE_AMOUNT,
      UNSTAKE_DELAY_SEC
    ).data;

  const entryPointDeploySalt: string = ethers.utils.formatBytes32String(
    String.fromCharCode(0)
  );
  return (await deployFromSingletonFactory(
    singletonFactory,
    "TestEntryPoint",
    entryPointBytecode,
    entryPointDeploySalt
  )) as EntryPoint;
}

async function deployPaymaster(
  singletonFactory: SingletonFactory
): Promise<VerifyingPaymaster> {
  const verifyingPaymasterFactory: ContractFactory =
    await ethers.getContractFactory("VerifyingPaymaster");

  const verifyingPaymasterBytecode: BytesLike | undefined =
    verifyingPaymasterFactory.getDeployTransaction().data;

  const verifyingPaymasterDeploySalt: string = ethers.utils.formatBytes32String(
    String.fromCharCode(0)
  );

  return (await deployFromSingletonFactory(
    singletonFactory,
    "VerifyingPaymaster",
    verifyingPaymasterBytecode,
    verifyingPaymasterDeploySalt
  )) as VerifyingPaymaster;
}

async function deployPaymasterProxy(
  singletonFactory: SingletonFactory,
  paymasterContractImplementationAddress: string,
  entryPointAddress: string,
  verifyingSigner: Signer,
  maxCost: BigNumber,
  salt: number
): Promise<VerifyingPaymaster> {
  const verifyingPaymasterProxyFactory: ContractFactory =
    await ethers.getContractFactory("VerifyingPaymasterProxy");

  const verifyingPaymasterFactory: ContractFactory =
    await ethers.getContractFactory("VerifyingPaymaster");

  const verifyingPaymasterProxyBytecode: BytesLike | undefined =
    verifyingPaymasterProxyFactory.getDeployTransaction(
      paymasterContractImplementationAddress,
      verifyingPaymasterFactory.interface.encodeFunctionData("initialize", [
        [entryPointAddress],
        await verifyingSigner.getAddress(),
        maxCost,
      ])
    ).data;

  const verifyingPaymasterProxyDeploySalt: string =
    ethers.utils.formatBytes32String(String.fromCharCode(salt));

  return (await deployFromSingletonFactory(
    singletonFactory,
    "VerifyingPaymasterProxy",
    verifyingPaymasterProxyBytecode,
    verifyingPaymasterProxyDeploySalt
  )) as VerifyingPaymaster;
}

async function setEntryPoint(
  verifyingPaymaster: VerifyingPaymaster,
  entryPoints: Array<string>
): Promise<void> {
  const result = await verifyingPaymaster.setEntryPoint(entryPoints);
  await result.wait();
}

async function addStake(
  verifyingPaymaster: VerifyingPaymaster,
  entryPoint: EntryPoint,
  amount: BigNumber
): Promise<void> {
  const result = await verifyingPaymaster.addStake(
    entryPoint.address,
    UNSTAKE_DELAY_SEC,
    {
      value: amount,
    }
  );
  await result.wait();
}

async function unlockStake(
  verifyingPaymaster: VerifyingPaymaster,
  entryPoint: EntryPoint
): Promise<void> {
  const unlockStakeResult: Result = await verifyingPaymaster.unlockStake(
    entryPoint.address
  );
  await unlockStakeResult.wait();
}

async function withdrawStake(
  verifyingPaymaster: VerifyingPaymaster,
  entryPoint: EntryPoint,
  withdrawTo: Signer
) {
  const unlockStakeResult: Result = await verifyingPaymaster.withdrawStake(
    entryPoint.address,
    await withdrawTo.getAddress()
  );
  await unlockStakeResult.wait();
}

async function addDeposit(
  verifyingPaymaster: VerifyingPaymaster,
  entryPoint: EntryPoint,
  amount: BigNumber
): Promise<void> {
  const result = await verifyingPaymaster.deposit(entryPoint.address, {
    value: amount,
  });
  await result.wait();
}

async function withdrawDeposit(
  verifyingPaymaster: VerifyingPaymaster,
  entryPoint: EntryPoint,
  receiverSigner: Signer,
  amount: BigNumber
) {
  const result = await verifyingPaymaster.withdrawTo(
    entryPoint.address,
    await receiverSigner.getAddress(),
    amount
  );
  await result.wait();
}

async function timeout(timeInSec: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeInSec * 1000);
  });
}

describe("VerifyingPaymaster", function () {
  //   console.log("------------ STARTING VerifyingPaymaster ------------");
  let singletonFactory: SingletonFactory;
  let entryPoint: EntryPoint;
  let paymasterContractImplementation: VerifyingPaymaster;
  let verifyingSigner: Signer,
    deploySigner: Signer,
    receiverSigner: Signer,
    unAuthorisedSigner: Signer;

  before(async function () {
    // console.log("------------ BEFORE VerifyingPaymaster ------------");
    const signers: Signer[] = await ethers.getSigners();
    [verifyingSigner, deploySigner, receiverSigner, unAuthorisedSigner] =
      signers;
    // console.log("------------ DEPLOYING FACTORY ------------");
    singletonFactory = await deploySingletonFactory();
    await singletonFactory.deployed();
    // console.log("============ DEPLOYED FACTORY ============");
    // console.log("------------ DEPLOYING ENTRYPOINT ------------");
    entryPoint = await deployEntryPointContract(
      singletonFactory.connect(deploySigner) as SingletonFactory
    );
    await entryPoint.deployed();
    // console.log("============ DEPLOYED FACTORY ============");
    // console.log("------------ DEPLOYING PAYMASTER IMPL ------------");
    paymasterContractImplementation = await deployPaymaster(
      singletonFactory.connect(deploySigner) as SingletonFactory
    );
    await paymasterContractImplementation.deployed();
    // console.log("============ DEPLOYED PAYMASTER IMPL ============");
  });

  let salt: number = 0;
  let paymasterProxy: VerifyingPaymaster;
  let verifyingPaymaster: VerifyingPaymaster;

  beforeEach(async function () {
    const maxCost: BigNumber = ethers.utils.parseEther("5");
    //   console.log("------------ DEPLOYING PAYMASTER PROXY ------------");
    singletonFactory.connect(deploySigner);
    paymasterProxy = await deployPaymasterProxy(
      singletonFactory.connect(deploySigner) as SingletonFactory,
      paymasterContractImplementation.address,
      entryPoint.address,
      verifyingSigner,
      maxCost,
      salt
    );
    salt++;
    verifyingPaymaster = paymasterContractImplementation.attach(
      paymasterProxy.address
    ) as VerifyingPaymaster;
    verifyingPaymaster.connect(verifyingSigner);
    await paymasterProxy.deployed();
    //   console.log("============ DEPLOYED PAYMASTER PROXY ============");
  });

  describe("Staking Tests", function () {
    it("should add stake", async function () {
      await addStake(verifyingPaymaster, entryPoint, STAKE_AMOUNT);
      const depositInfo: DepositInfo = await entryPoint.getDepositInfo(
        verifyingPaymaster.address
      );
      expect(depositInfo.stake.eq(STAKE_AMOUNT));
    });
    it("should unstake", async function () {
      await addStake(verifyingPaymaster, entryPoint, STAKE_AMOUNT);
      const time: number = Date.now();
      await unlockStake(verifyingPaymaster, entryPoint);

      const depositInfo: DepositInfo = await entryPoint.getDepositInfo(
        verifyingPaymaster.address
      );
      expect(depositInfo.withdrawTime.gt(time + UNSTAKE_DELAY_SEC));
    });
    it("should withdraw", async function () {
      await addStake(verifyingPaymaster, entryPoint, STAKE_AMOUNT);
      const time: number = Date.now();
      await unlockStake(verifyingPaymaster, entryPoint);
      await timeout(UNSTAKE_DELAY_SEC + 1); // 1 second buffer
      const balanceReceiver = await receiverSigner.getBalance();
      await withdrawStake(verifyingPaymaster, entryPoint, receiverSigner);
      const balanceReceiverPostWithdraw = await receiverSigner.getBalance();

      expect(balanceReceiver.add(STAKE_AMOUNT).eq(balanceReceiverPostWithdraw));
    });
  });

  describe("Deposit Tests", function () {
    it("should add deposit", async function () {
      await addDeposit(verifyingPaymaster, entryPoint, DEPOSIT_AMOUNT);
      const depositInfo: DepositInfo = await entryPoint.getDepositInfo(
        verifyingPaymaster.address
      );
      expect(depositInfo.deposit.eq(DEPOSIT_AMOUNT));
    });

    it("should withdraw deposit", async function () {
      await addDeposit(verifyingPaymaster, entryPoint, DEPOSIT_AMOUNT);
      const balanceReceiver = await receiverSigner.getBalance();
      await withdrawDeposit(
        verifyingPaymaster,
        entryPoint,
        receiverSigner,
        WITHDRAW_AMOUNT
      );
      const balanceReceiverPostWithdraw = await receiverSigner.getBalance();
      const depositInfo: DepositInfo = await entryPoint.getDepositInfo(
        verifyingPaymaster.address
      );
      expect(depositInfo.deposit.eq(DEPOSIT_AMOUNT.sub(WITHDRAW_AMOUNT)));
      expect(
        balanceReceiver.add(WITHDRAW_AMOUNT).eq(balanceReceiverPostWithdraw)
      );
    });
  });

  describe("EntryPoints", async function () {
    it("should change entrypoint", async function () {
      await setEntryPoint(verifyingPaymaster, [ethers.constants.AddressZero]);
      const entryPoints = await verifyingPaymaster.getEntryPoints();
      expect(entryPoints.length === 1);
      expect(entryPoints[0] === ethers.constants.AddressZero);
    });
  });

  describe("Check onlyOwner Functions", function () {
    it("should fail to call setEntryPoint", async function () {
      await expect(
        setEntryPoint(
          verifyingPaymaster.connect(unAuthorisedSigner) as VerifyingPaymaster,
          [ethers.constants.AddressZero]
        )
      ).to.be.reverted;
    });
    it("should fail to call withdrawTo", async function () {
      await expect(
        withdrawDeposit(
          verifyingPaymaster.connect(unAuthorisedSigner) as VerifyingPaymaster,
          entryPoint,
          receiverSigner,
          WITHDRAW_AMOUNT
        )
      ).to.be.reverted;
    });
    it("should fail to call unlockStake", async function () {
      await expect(
        unlockStake(
          verifyingPaymaster.connect(unAuthorisedSigner) as VerifyingPaymaster,
          entryPoint
        )
      ).to.be.reverted;
    });
    it("should fail to call withdrawStake", async function () {
      await expect(
        withdrawStake(
          verifyingPaymaster.connect(unAuthorisedSigner) as VerifyingPaymaster,
          entryPoint,
          receiverSigner
        )
      ).to.be.reverted;
    });
  });
});
