import fetch from 'node-fetch';
import { MaticAddresses } from './addresses/MaticAddresses'
import { FtmAddresses } from './addresses/FtmAddresses'

// import { Equalizer } from "../typechain";

/*const contracts = {
    matic : '0x26359EE24bE2A54E799e4D90a477fa8536E92FED',
    fantom: '',
    bsc   : '',
}*/

interface String2String { [key: string]: string }
interface TokenMap {[key: string]: String2String};
interface TokensByChainId {[key: string]:[string]}


const chainIds: String2String = {
    // ethereum:'1',
    bsc     :'56',
    // xdai	:'100',         // https://www.xdaichain.com/
    // heco	:'128',         // https://docs.hecochain.com/#/mainnet
    matic	:'137',
    fantom	:'250',
    // fusion	:'32659',   // https://fusiondev.gitbook.io/fusion/build/quick-links
    avax	:'43114',       // https://docs.avax.network/
    // bitocin	:'BTC',
    // litecoin:'LTC',
    // blocknet:'BLOCK',
}

const factories: String2String = {
    137: MaticAddresses.QUICK_FACTORY,
    250: FtmAddresses.SPOOKY_SWAP_FACTORY,
    56:  '0xca143ce32fe78f1f7019d7d551a6402fc5350c73', // https://bscscan.com/address/0xca143ce32fe78f1f7019d7d551a6402fc5350c73
    // 43114: '', // TODO
}


const USDC: String2String = {
    137:   MaticAddresses.USDC_TOKEN,
    250:   FtmAddresses.USDC_TOKEN,
    56:    '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',    // https://www.bscscan.com/token/0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d
    43114: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664', // https://avascan.info/blockchain/c/address/0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664/token
}

const chains = Object.keys(chainIds);
const chainIdsArray = Object.values(chainIds);
console.log('chains', chains);
const chainNames = chains.map( name => ({filed: chainIds[name], value: name}));
console.log('chainNames', chainNames);

let tokenMap: TokenMap = {}
let tokensByChainId: TokensByChainId = {}

async function loadBridgeInfo(chain: string) {
    const url = 'https://bridgeapi.anyswap.exchange/v2/serverInfo/';
    const chainId = chainIds[chain];
    console.log('loadBridgeInfo chainId', chainId);
    const response = await fetch(url + chainId);
    const info = await response.json();
    console.log(chain, 'info', Object.keys(info).length);
    processBridgeInfo(info);
}

async function loadBridgesInfo() {
    const loadPromises = [];
    for (const chain of chains)
        loadPromises.push(loadBridgeInfo(chain));
    await Promise.all(loadPromises);
}
function processBridgeInfo(bridgesInfo:any) {
    for (const token of Object.keys(bridgesInfo)) {
        const info = bridgesInfo[token];
        if (!info.SrcToken.ContractAddress ||
            !info.DestToken.ContractAddress)
            continue;
        if (!chainIdsArray.includes(info.srcChainID) ||
            !chainIdsArray.includes(info.destChainID))
            continue;

        if (!tokenMap[token]) tokenMap[token] = {}
        tokenMap[token][info.srcChainID] = info.SrcToken.ContractAddress;
        tokenMap[token][info.destChainID] = info.DestToken.ContractAddress;
    }
}

function filterTokenMap(minTwins: number) {
    // console.log('tokenMap', tokenMap);
    const map: TokenMap = {};
    for (const token of Object.keys(tokenMap)) {
        const twins = tokenMap[token];
        if (Object.keys(twins).length >= minTwins)
            map[token] = twins
    }
    console.log('map', map);
    console.log('map length', Object.keys(map).length);
    return map;
}

function groupTokensByChainId(map: TokenMap) {
    const group: TokensByChainId = {}
    for (const token of Object.keys(map)) {
        const twins = map[token];
        for (const id of Object.keys(twins)) {
            if (!group[id]) group[id] = [twins[id]]
            else group[id].push(twins[id]);
        }
    }
    return group;
}

async function init() {
    await loadBridgesInfo();
    tokenMap = filterTokenMap(4)
    const tokensByChainId = groupTokensByChainId(tokenMap)
    console.log('tokensByChainId', tokensByChainId);
}

async function main() {
    await init();
}

main().then()
