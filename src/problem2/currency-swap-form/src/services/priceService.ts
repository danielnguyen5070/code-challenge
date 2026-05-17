import {
  buildTokens,
  normalizePrices,
} from '@lib/prices';
import type { MarketData, PriceEntry } from '@types';

const PRICES_API_URL = 'https://interview.switcheo.com/prices.json';

export async function fetchMarketData(): Promise<MarketData> {
  const response = await fetch(PRICES_API_URL);

  if (!response.ok) {
    throw new Error(`Failed to load prices (${response.status})`);
  }

  const entries = (await response.json()) as PriceEntry[];
  const priceMap = normalizePrices(entries);
  const tokens = buildTokens(priceMap);

  return { tokens, priceMap };
}
