/** Raw price row from the Switcheo prices API */
export type PriceEntry = {
  currency: string;
  date: string;
  price: number;
};

/** Token available in pickers with its latest USD price */
export type Token = {
  symbol: string;
  price: number;
};
