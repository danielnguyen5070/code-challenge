/** React Hook Form values for the swap card */
export type SwapFormValues = {
  fromSymbol: string;
  toSymbol: string;
  fromAmount: string;
};

export type SwapRequest = {
  fromSymbol: string;
  toSymbol: string;
  fromAmount: string;
  receiveAmount: string;
};

export type SwapResult = {
  success: true;
  message: string;
};
