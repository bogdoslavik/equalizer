// import { expect } from "chai";
import { ethers, network } from "hardhat";
import { MaticAddresses } from "../scripts/addresses/MaticAddresses"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Equalizer } from "../typechain";

const EQUALIZER_MATIC = '0x26359EE24bE2A54E799e4D90a477fa8536E92FED';

let signer: SignerWithAddress;
let equalizer: Equalizer;

describe("Equalizer", function () {
  before(async function () {
    signer = (await ethers.getSigners())[0];
    console.log('network.name', network.name);

    if (network.name === 'matic') {

      equalizer = await ethers.getContractAt(
          "Equalizer", EQUALIZER_MATIC, signer
      ) as Equalizer;

    } else if (network.name === 'hardhat') {

      const EqualizerFactory = await ethers.getContractFactory("Equalizer");
      equalizer = await EqualizerFactory.deploy() as Equalizer;
      await equalizer.deployed();
      console.log('Contract deployed');

    } else console.error('Unsupported network', network.name)

  })


  it.skip("Should find pair exceptions", async function () {

    const factory = MaticAddresses.QUICK_FACTORY;

    let batch = 100;
    const ex = [];

    const owner = await equalizer.getOwner();
    console.log('owner', owner);
    const allPairsLength = (await equalizer.allPairsLengthUniswapV2(factory)).toNumber();
    console.log('allPairsLength', allPairsLength);

  });


});
