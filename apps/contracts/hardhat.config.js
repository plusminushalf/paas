const dotenv = require("dotenv");
dotenv.config();

require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("solidity-coverage");

const config = {
  solidity: {
    version: "0.8.9",
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

exports.default = config;
