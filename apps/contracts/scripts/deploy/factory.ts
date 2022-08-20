// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

async function main() {
  const [factoryDeployer]: Array<SignerWithAddress> = await ethers.getSigners();

  // Deploy factory
  console.log("----------- DEPLOY FACTORY -----------");
  const SingletonFactory = await ethers.getContractFactory(
    "SingletonFactory",
    factoryDeployer
  );
  const singletonFactory = await SingletonFactory.deploy();
  await singletonFactory.deployed();
  console.log("Factory Addr: ", singletonFactory.address);
  console.log("-----------END DEPLOY FACTORY -----------");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
