const { HardhatUserConfig } = require("hardhat/config");
require("@nomicfoundation/hardhat-toolbox");
const dotenv = require("dotenv");

dotenv.config();

if (!process.env.SEED_PHRASE) {
  throw new Error("Please set your SEED_PHRASE in a .env file");
}

const config = {
  solidity: {
    version: "0.8.19",
    compilers: [
      {
        version: "0.8.19",
      },
      {
        version: "0.8.18",
      },
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      accounts: {
        mnemonic: process.env.SEED_PHRASE,
      },
      chainId: 50312,
    },
    somnia: {
      url: "https://dream-rpc.somnia.network",
      accounts: {
        mnemonic: process.env.SEED_PHRASE,
      },
      chainId: 50312,
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  sourceDirs: [
    "./contracts",
    "./contracts/interfaces",
  ],
  env: {
    NFT_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS,
    AUCTION_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS,
  },
};

module.exports = config;
