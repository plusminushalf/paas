// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the

const { ethers } = require("hardhat");

// global scope, and execute the script.
require("@nomiclabs/hardhat-ethers");

async function main() {
  const [paymasterSigner] = await ethers.getSigners();
  const entryPointAddress = process.env.ENTRYPOINT_ADDRESS;
  const factoryAddress = process.env.PAAS_FACTORY_ADDRESS;

  const singletonFactory = await ethers.getContractAt(
    "SingletonFactory",
    factoryAddress
  );

  const DappPaymasterProxy = await ethers.getContractFactory(
    "DappPaymasterProxy"
  );

  const DappPaymasterProxyInterface = DappPaymasterProxy.interface;

  const DappPaymasterProxyDeployTransacton =
    DappPaymasterProxy.getDeployTransaction(
      process.env.PAYMASTER_IMPLEMENTATION,
      DappPaymasterProxyInterface.encodeFunctionData("initialize", [
        paymasterSigner,
        [],
        paymasterSigner,
        name,
      ])
    ).data;

  const PaymasterSalt = ethers.utils.formatBytes32String(
    String.fromCharCode(Date.now())
  );

  const transaction = await singletonFactory.deploy(
    DappPaymasterProxyDeployTransacton,
    PaymasterSalt
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
