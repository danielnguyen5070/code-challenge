import { useEffect, useState } from 'react';
import { fetchMarketData } from '@services';
import type { Token } from '@types';

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
        const { tokens, priceMap } = await fetchMarketData();

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
