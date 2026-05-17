import type { Token } from './token';

/** Normalized market snapshot after prices are loaded */
export type MarketData = {
  tokens: Token[];
  priceMap: Map<string, number>;
};
