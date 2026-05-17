import { fetchMarketData } from '@services';
import type { Token } from '@types';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTokenPrices } from './useTokenPrices';

vi.mock('@services', () => ({
  fetchMarketData: vi.fn(),
}));

const mockedFetchMarketData = vi.mocked(fetchMarketData);

const TEST_TOKENS: Token[] = [
  { symbol: 'ETH', price: 3000 },
  { symbol: 'USDC', price: 1 },
];

const TEST_PRICE_MAP = new Map(
  TEST_TOKENS.map((token) => [token.symbol, token.price]),
);

describe('useTokenPrices', () => {
  beforeEach(() => {
    mockedFetchMarketData.mockReset();
  });

  it('should start in loading status when mounted', () => {
    mockedFetchMarketData.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useTokenPrices());

    expect(result.current).toEqual({ status: 'loading' });
    expect(mockedFetchMarketData).toHaveBeenCalledTimes(1);
  });

  it('should return ready state with tokens and price map when fetch succeeds', async () => {
    mockedFetchMarketData.mockResolvedValue({
      tokens: TEST_TOKENS,
      priceMap: TEST_PRICE_MAP,
    });

    const { result } = renderHook(() => useTokenPrices());

    await waitFor(() => {
      expect(result.current.status).toBe('ready');
    });

    expect(result.current).toEqual({
      status: 'ready',
      tokens: TEST_TOKENS,
      priceMap: TEST_PRICE_MAP,
    });
  });

  it('should return error state with message when fetch rejects with Error', async () => {
    mockedFetchMarketData.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useTokenPrices());

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current).toEqual({
      status: 'error',
      message: 'Network error',
    });
  });

  it('should return a generic error message when fetch rejects with a non-Error value', async () => {
    mockedFetchMarketData.mockRejectedValue('offline');

    const { result } = renderHook(() => useTokenPrices());

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current).toEqual({
      status: 'error',
      message: 'Unable to load prices',
    });
  });

  it('should not update state after unmount when fetch completes late', async () => {
    let resolveFetch!: (value: {
      tokens: Token[];
      priceMap: Map<string, number>;
    }) => void;

    mockedFetchMarketData.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    );

    const { result, unmount } = renderHook(() => useTokenPrices());

    expect(result.current.status).toBe('loading');

    unmount();

    await act(async () => {
      resolveFetch({ tokens: TEST_TOKENS, priceMap: TEST_PRICE_MAP });
    });

    expect(result.current).toEqual({ status: 'loading' });
  });
});
