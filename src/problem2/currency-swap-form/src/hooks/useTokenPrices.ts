import { useEffect, useState } from 'react';
import type { PriceEntry, Token } from '../types';
import { buildTokens, normalizePrices, PRICES_API_URL } from '../lib/prices';

type PricesState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; tokens: Token[]; priceMap: Map<string, number> };

export function useTokenPrices() {
  const [state, setState] = useState<PricesState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(PRICES_API_URL);
        if (!response.ok) {
          throw new Error(`Failed to load prices (${response.status})`);
        }

        const entries = (await response.json()) as PriceEntry[];
        const priceMap = normalizePrices(entries);
        const tokens = buildTokens(priceMap);

        if (!cancelled) {
          setState({ status: 'ready', tokens, priceMap });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            status: 'error',
            message:
              error instanceof Error ? error.message : 'Unable to load prices',
          });
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
