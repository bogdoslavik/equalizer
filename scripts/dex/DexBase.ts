type address = string;

interface IQuote {
  body: any;
  amountOut: bigint;
  estimatedGas: bigint;
}

interface IQuoteRequest {
  chainId: number,
  tokenIn: address,
  tokenOut: address,
  amountIn: bigint
}

abstract class DexBase {
  abstract qoute(request: IQuoteRequest): IQuote;
  abstract swap(request: IQuoteRequest, fromAddress: address, slippage: number): string;
}
