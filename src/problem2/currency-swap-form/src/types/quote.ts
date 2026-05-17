export type QuoteInput = {
  payAmount: number;
  fromPrice: number;
  toPrice: number;
};

export type QuoteResult = {
  receiveAmount: number | null;
  rate: number | null;
  fromUsd: number | null;
  toUsd: number | null;
};
