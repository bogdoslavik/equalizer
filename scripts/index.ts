// import { Equalizer } from "../typechain";

/*const contracts = {
    matic : '0x26359EE24bE2A54E799e4D90a477fa8536E92FED',
    fantom: '',
    bsc   : '',
}*/

interface String2String { [key: string]: string }

const chainIds: String2String = {
    // ethereum:'1',
    bsc     :'56',
    // xdai	:'100',         // https://www.xdaichain.com/
    // heco	:'128',         // https://docs.hecochain.com/#/mainnet
    matic	:'137',
    fantom	:'250',
    // fusion	:'32659',   // https://fusiondev.gitbook.io/fusion/build/quick-links
    // avax	:'43114',       // https://docs.avax.network/
    // bitocin	:'BTC',
    // litecoin:'LTC',
    // blocknet:'BLOCK',
}

const chains = Object.keys(chainIds);
console.log('chains', chains);
const chainNames = chains.map( name => ({filed: chainIds[name], value: name}));
console.log('chainNames', chainNames);



async function loadBridgeInfo(chain: string) {
    const chainId = chainIds[chain];
    console.log('loadBridgeInfo chainId', chainId);
}

async function loadBridgesInfo() {
    const loadPromises = [];
    for (const chain of chains)
        loadPromises.push(loadBridgeInfo(chain));
    await Promise.all(loadPromises);
}

async function init() {
    await loadBridgesInfo();

}

async function main() {
    await init();
}

main().then()
