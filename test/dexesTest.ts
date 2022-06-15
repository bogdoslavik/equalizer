import {expect} from "chai";
import {ethers} from "ethers";
import {IQuoteRequest} from "../scripts/dex/DexBase";
import {chainIds} from "../scripts/constants";
import {MaticAddresses} from "../scripts/addresses/MaticAddresses";
import {MetaDex} from "../scripts/dex/MetaDex";

describe("MetaDex", function () {
  const dex = new MetaDex();
  const usdAmount = ethers.utils.parseUnits('1000', 6);
  console.log('usdAmount', usdAmount);

  it("Quote", async function () {
    const r: IQuoteRequest = {
      chainId: chainIds.matic,
      fromTokenAddress: MaticAddresses.USDC_TOKEN,
      toTokenAddress: MaticAddresses.USDT_TOKEN,
      amount: usdAmount.toString()
    }
    const q = await dex.quote(r)
    console.log('q', q);
  });
});
