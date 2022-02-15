// import { expect } from "chai";
import { ethers, network } from "hardhat";
import { MaticAddresses } from "../scripts/addresses/MaticAddresses"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Equalizer } from "../typechain";

const EQUALIZER_MATIC = '0x6dF112C6C67373e6d97CC1b45D39e6B7dE2BB381';

let signer: SignerWithAddress;
let equalizer: Equalizer;

describe("Skimmer", function () {
  before(async function () {
    signer = (await ethers.getSigners())[0];
    console.log('network.name', network.name);

    if (network.name === 'matic') {

      equalizer = await ethers.getContractAt(
          "Equalizer", EQUALIZER_MATIC, signer
      ) as Equalizer;

    } else if (network.name === 'hardhat') {

      const Equalizer = await ethers.getContractFactory("Equalizer");
      equalizer = await Equalizer.deploy() as Equalizer;
      await equalizer.deployed();

    } else console.error('Unsupported network', network.name)

  })

  it("Should return pairs for skim", async function () {

    const batch = 100;
    const factory = MaticAddresses.QUICK_FACTORY;

    const allPairsLengthBN = await equalizer.allPairsLengthUniswapV2(factory);
    const allPairsLength = allPairsLengthBN.toNumber();
    console.log('allPairsLength', allPairsLength);
    for (let i = 0; i < allPairsLength; i += batch) {
      const pairsForSkim = await equalizer.scanSkimsUniswapV2(factory, i, batch);
      console.log('pairsForSkim', pairsForSkim);
    }
  });
});
