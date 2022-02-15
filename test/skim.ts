// import { expect } from "chai";
import { ethers, network } from "hardhat";
import { MaticAddresses } from "../scripts/addresses/MaticAddresses"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Skimmer } from "../typechain";

const SKIMMER_MATIC = '0x26359EE24bE2A54E799e4D90a477fa8536E92FED';

let signer: SignerWithAddress;
let skimmer: Skimmer;

describe("Skimmer", function () {
  before(async function () {
    signer = (await ethers.getSigners())[0];
    console.log('network.name', network.name);

    if (network.name === 'matic') {

      skimmer = await ethers.getContractAt(
          "Skimmer", SKIMMER_MATIC, signer
      ) as Skimmer;

    } else if (network.name === 'hardhat') {

      const SkimmerFactory = await ethers.getContractFactory("Skimmer");
      skimmer = await SkimmerFactory.deploy() as Skimmer;
      await skimmer.deployed();
      console.log('Contract deployed');

    } else console.error('Unsupported network', network.name)

  })

  const MIN_CREAM = 100000;
  const exceptions = [
      683,1008,2876,5129,5136,5820,7123,8593,8846,8847,8848,9655,9923,10858,12263,12353,
    13582,14075,14076,14650,14979,15581,16754,17367,18292,18496,18582,19378,19380,19588,19962,
    19963,19964,20033,20132,20170,20573,20884,22261,22725,22926,23394,23571,23801,23814,
    24099,24298,24567,26759,26811,26819,27040,27044,27051,27053,27054,27057,27060,27063,
    27079,27082,27090,27092,27094,27101,27104,27112,27124,27130,27133,27136,27146,27156,
    27167,27175,27183,27198,27205,27211,27213,27224,27229,27232,27238,27244,27248,27253,
    27264,27271,27276,27283,27293,27296,27303,27310,27312,27315,27317,27319,27322,27324,
    27331,27338,27352,27355,27360,27362,27365,27368,27369,27373,27376,27377,27383,27386,
    27388,27393,27406,27411,27422,27427,27430,27449,27476,27482,27487,27492,27498,27503,
    27507,27515,27524,27532,27542,27554,27574,27609,27616,27629,27630,27632,27637,27651,
    27678,27696,27715,27735,27741,27746,27754,27767,27777,27785,27788,27801,27814,27817,
    27820,27826,27840,27844,27847,27854,27868,27873,27878,27889,27904,27912,27921,27922,
    27926,27929,27934,27938,27943,27951,27959,27961,27971,27974,27980,27984,27993,27999,
    28004,28012,28017,28022,28026,28035,28043,28051,28061,28065,28069,28073,28077,28078,
    28083,28086,28098,28101,28107,28117,28120,28125,28136,28149,28158,28246,28574];


  it.skip("Should find pair exceptions", async function () {

    const factory = MaticAddresses.QUICK_FACTORY;

    let batch = 100;
    const ex = [];

    const owner = await skimmer.getOwner();
    console.log('owner', owner);
    const allPairsLengthBN = await skimmer.allPairsLengthUniswapV2(factory);
    const allPairsLength = allPairsLengthBN.toNumber();
    console.log('allPairsLength', allPairsLength);
    // for (let i = 5821; i < allPairsLength; i += batch) {
    let i = 0;
    while (i < allPairsLength) {
      console.log('i', i, batch);
      try {

        const last = i + batch;
        const filteredExceptions = exceptions.filter(e => e>=i && e<=last);
        const pairsForSkim = await skimmer.scanSkimsUniswapV2(
            factory, i, batch, MIN_CREAM, filteredExceptions);
        if (pairsForSkim.length>0) console.log(i, 'pairsForSkim', pairsForSkim);
        i += batch;

      } catch (e) {

        console.log('Exception!')
        if (batch === 1) {
          console.log('!!!', i);
          ex.push(i);
          console.log(ex.join(','))
          batch = 100;
          i++;
        } else batch /= 10;
      }

    }
  });

  it.only("Should skim", async function () {

    const factory = MaticAddresses.QUICK_FACTORY;
    const initialBatch = 1000;
    let batch = initialBatch;
    const ex = [];

    const owner = await skimmer.getOwner();
    console.log('owner', owner);
    const allPairsLengthBN = await skimmer.allPairsLengthUniswapV2(factory);
    const allPairsLength = allPairsLengthBN.toNumber();
    console.log('allPairsLength', allPairsLength);

    let i = 21000;
    while (i < allPairsLength) {
      console.log('i', i, batch);
      try {

        const last = i + batch;
        const filteredExceptions = exceptions.filter(e => e>=i && e<=last);
        console.log('filteredExceptions', filteredExceptions);
        const pairsForSkim = await skimmer.scanSkimsUniswapV2(
            factory, i, batch, MIN_CREAM, filteredExceptions);
        if (pairsForSkim.length>0) {
          console.log(i, 'pairsForSkim', pairsForSkim);
          // Skim
          const txSkim = await skimmer.skimPairs(pairsForSkim);
          console.log('txSkim', txSkim.hash);
          await txSkim.wait();
        }
        i += batch;

      } catch (e) {

        console.log('Exception!')
        if (batch === 1) {
          console.log('!!!', i);
          ex.push(i);
          console.log(ex.join(','))
          batch = initialBatch;
          i++;
        } else batch /= 10;
      }

    }
  });
});
