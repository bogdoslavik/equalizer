import Axios from 'axios';
import {DexBase, DEFAULT_DEX_TIMEOUT, IQuoteRequest, IQuote } from "./DexBase";

export class OneInch extends DexBase {
  private axios;
  constructor() {
    super();
    this.axios = Axios.create({
      baseURL: 'https://api.1inch.io/v4.0/',
      timeout: DEFAULT_DEX_TIMEOUT,
    });
  }

  public async quote(request: IQuoteRequest): Promise<IQuote> {

    const params = new URLSearchParams({
      fromTokenAddress: request.fromTokenAddress,
      toTokenAddress: request.toTokenAddress,
      amount: request.amount.toString()
    });

    const response = await this.axios.get(`/${request.chainId}/quote/`, {params});
    const data = response.data;

    return {
      data,
      amountOut: data.toTokenAmount,
      estimatedGas: data.estimatedGas,
    }
  }

  public async swap(request: IQuoteRequest, fromAddress: string, slippage: number): Promise<string> {
    const params = new URLSearchParams({
      fromTokenAddress: request.fromTokenAddress,
      toTokenAddress: request.toTokenAddress,
      amount: request.amount.toString(),
      fromAddress,
      slippage: slippage.toString(),
    });

    const response = await this.axios.get(`/${request.chainId}/swap/`, {params});
    console.log('response', response);

    const data = response.data;
    console.log('data', data);
    return 'txId' // TODO send tx
  }

}
