import * as dotenv from "dotenv";

import {HardhatUserConfig, task} from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "hardhat-deploy";

dotenv.config();

const argv = require('yargs/yargs')()
    .env('EQ')
    .options({
        hardhatChainId: {
            type: "number",
            default: 137
        },
        maticRpcUrl: {
            type: "string",
        },
        ftmRpcUrl: {
            type: "string",
        },
        ethRpcUrl: {
            type: "string",
            default: ''
        },
        infuraKey: {
            type: "string",
        },
        networkScanKey: {
            type: "string",
        },
        privateKey: {
            type: "string",
            default: "85bb5fa78d5c4ed1fde856e9d0d1fe19973d7a79ce9ed6c0358ee06a4550504e" // random account
        },
        maticForkBlock: {
            type: "number",
            default: 23945980
        },
        ftmForkBlock: {
            type: "number",
            default: 29376400
        },
    }).argv;

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();

    for (const account of accounts) {
        console.log(account.address);
    }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: "0.8.4",
                settings: {
                    optimizer: {
                        enabled: true,
                        // runs: 150,
                    }
                }
            },
        ]
    },
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            allowUnlimitedContractSize: true,
            chainId: argv.hardhatChainId,
            // timeout: 99999 * 2,
            gas: argv.hardhatChainId === 137 ? 19_000_000 :
                argv.hardhatChainId === 250 ? 11_000_000 :
                    9_000_000,
            forking: {
                url:
                    argv.hardhatChainId === 137 ? argv.maticRpcUrl :
                        argv.hardhatChainId === 250 ? argv.ftmRpcUrl :
                            undefined,
                blockNumber:
                    argv.hardhatChainId === 137 ? argv.maticForkBlock !== 0 ? argv.maticForkBlock : undefined :
                        argv.hardhatChainId === 250 ? argv.ftmForkBlock !== 0 ? argv.ftmForkBlock : undefined :
                            undefined
            },
            accounts: {
                mnemonic: "test test test test test test test test test test test junk",
                path: "m/44'/60'/0'/0",
                accountsBalance: "100000000000000000000000000000"
            },
        },
        ftm: {
            url: argv.ftmRpcUrl || '',
            timeout: 99999,
            chainId: 250,
            gas: 10_000_000,
            // gasPrice: 100_000_000_000,
            // gasMultiplier: 2,
            accounts: [argv.privateKey],
        },
        matic: {
            url: argv.maticRpcUrl,
            timeout: 99999,
            chainId: 137,
            // gas: 19_000_000,
            // gasPrice: 100_000_000_000,
            gasMultiplier: 1.3,
            accounts: [argv.privateKey],
        },
        eth: {
            url: argv.ethRpcUrl,
            chainId: 1,
            accounts: [argv.privateKey],
        },
    },
    gasReporter: {
        enabled: process.env.REPORT_GAS !== undefined,
        currency: "USD",
    },
    etherscan: {
        apiKey: argv.networkScanKey
    },
    mocha: {
        timeout: 60000*60 //1hr
    },
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
        }
    },
};

export default config;
