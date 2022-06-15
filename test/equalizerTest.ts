// import { expect } from "chai";
import { ethers, network } from "hardhat";
import { MaticAddresses } from "../scripts/addresses/MaticAddresses"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Equalizer } from "../typechain";

const EQUALIZER_MATIC = '0x26359EE24bE2A54E799e4D90a477fa8536E92FED';

let signer: SignerWithAddress;
let equalizerTest: Equalizer;

describe("Equalizer", function () {
  before(async function () {
    signer = (await ethers.getSigners())[0];
    console.log('network.name', network.name);

    if (network.name === 'matic') {

      equalizerTest = await ethers.getContractAt(
          "Equalizer", EQUALIZER_MATIC, signer
      ) as Equalizer;

    } else if (network.name === 'hardhat') {

      const EqualizerFactory = await ethers.getContractFactory("Equalizer");
      equalizerTest = await EqualizerFactory.deploy() as Equalizer;
      await equalizerTest.deployed();
      console.log('Contract deployed');

    } else console.error('Unsupported network', network.name)

  })


  it.skip("Should find pair exceptions", async function () {

    const factory = MaticAddresses.QUICK_FACTORY;

    let batch = 100;
    const ex = [];

    const owner = await equalizerTest.getOwner();
    console.log('owner', owner);
    const allPairsLength = (await equalizerTest.allPairsLengthUniswapV2(factory)).toNumber();
    console.log('allPairsLength', allPairsLength);

  });


});
