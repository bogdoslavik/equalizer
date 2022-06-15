export const DEFAULT_DEX_TIMEOUT = 10 * 1000;

export interface IQuote {
  data: any;
  amountOut: bigint;
  estimatedGas: bigint;
}

export interface IQuoteRequest {
  chainId: string,
  fromTokenAddress: string,
  toTokenAddress: string,
  amount: string
}

export abstract class DexBase {
  abstract quote(request: IQuoteRequest): Promise<IQuote>;
  abstract swap(request: IQuoteRequest, fromAddress: string, slippage: number): Promise<string>;
}
