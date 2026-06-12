const { HardhatUserConfig } = require("hardhat/config");
require("@nomicfoundation/hardhat-toolbox");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, ".env") });

const CHAIN_ADMIN_KEY = process.env.CHAIN_ADMIN_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"; // hardhat default key (dev only)
const CHAIN_RPC_URL   = process.env.CHAIN_RPC_URL   || "http://127.0.0.1:8545";
const CHAIN_ID        = parseInt(process.env.CHAIN_ID || "31337");

const config = {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },

  paths: {
    sources:   "./src",
    tests:     "./test",
    artifacts: "./artifacts",
    cache:     "./cache",
  },

  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },

    privateChain: {
      url: CHAIN_RPC_URL,
      chainId: CHAIN_ID,
      accounts: [CHAIN_ADMIN_KEY],
      timeout: 60000,
    },

    apostleChain: {
      url: process.env.APOSTLE_CHAIN_RPC_URL || "http://apostle-chain:8545",
      chainId: 7332,
      accounts: [CHAIN_ADMIN_KEY],
    },
  },

  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
  },

  mocha: {
    extension: ["ts"],
    require: ["ts-node/register"],
  },
};

module.exports = config;
