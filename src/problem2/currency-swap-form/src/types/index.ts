export type PriceEntry = {
  currency: string;
  date: string;
  price: number;
};

export type Token = {
  symbol: string;
  price: number;
};

export type SwapFormValues = {
  fromSymbol: string;
  toSymbol: string;
  fromAmount: string;
};
