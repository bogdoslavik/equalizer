// import { expect } from "chai";
import { ethers, network } from "hardhat";
import { MaticAddresses } from "../scripts/addresses/MaticAddresses"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Equalizer } from "../typechain";

let signer: SignerWithAddress;
let equalizer: Equalizer;

describe("Skimmer", function () {
  before(async function () {
    signer = (await ethers.getSigners())[0];
    console.log('network.name', network.name);

    if (network.name === 'matic') {

    } else if (network.name === 'hardhat') {

      const Equalizer = await ethers.getContractFactory("Equalizer");
      equalizer = await Equalizer.deploy(MaticAddresses.WMATIC_TOKEN) as Equalizer;
      await equalizer.deployed();

    } else console.error('Unsupported network', network.name)

  })

  it("Should return pairs for skim", async function () {

    const batch = 10;
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
