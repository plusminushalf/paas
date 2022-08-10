// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const { ethers } = require("hardhat");

async function main() {
  const [paymasterSigner] = await ethers.getSigners();
  const entryPointAddress = process.env.ENTRYPOINT_ADDRESS;
  const factoryAddress = process.env.PAAS_FACTORY_ADDRESS;

  const singletonFactory = await ethers.getContractAt(
    "SingletonFactory",
    factoryAddress
  );

  const Paymaster = await ethers.getContractFactory("DappPaymaster");
  const PaymasterInitCode =
    Paymaster.getDeployTransaction(entryPointAddress).data;
  const PaymasterSalt = ethers.utils.formatBytes32String(
    String.fromCharCode(Date.now())
  );
  const paymasterDeployTx = await singletonFactory.deploy(
    PaymasterInitCode,
    PaymasterSalt
  );
  await paymasterDeployTx.wait();

  const paymasterAddress = await singletonFactory.computeAddress(
    PaymasterSalt,
    PaymasterInitCode
  );
  console.log("Paymaster Addr: ", paymasterAddress);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
