import { config } from "dotenv";
config();

import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "solidity-coverage";

module.exports = {
  solidity: {
    version: "0.8.12",
  },
  networks: {
    mumbai: {
      url: process.env.PAAS_CONTRACTS_MUMBAI_RPC || "",
      chainId: 80001,
      accounts: [process.env.PAAS_CONTRACTS_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: process.env.PAAS_CONTRACTS_POLYGONSCAN_API_KEY || "",
  },
};
