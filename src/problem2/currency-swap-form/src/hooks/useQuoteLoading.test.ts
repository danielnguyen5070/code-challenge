import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { QUOTE_DEBOUNCE_MS, useQuoteLoading } from './useQuoteLoading';

describe('useQuoteLoading', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should show quote loading when pay amount has not settled yet', () => {
    const { result, rerender } = renderHook(
      ({ amount }) => useQuoteLoading(amount),
      { initialProps: { amount: '' } },
    );

    rerender({ amount: '1' });

    expect(result.current.isQuoteLoading).toBe(true);
    expect(result.current.showQuoteSkeleton).toBe(true);
  });

  it('should clear quote loading when debounce delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ amount }) => useQuoteLoading(amount),
      { initialProps: { amount: '' } },
    );

    rerender({ amount: '1' });

    act(() => {
      vi.advanceTimersByTime(QUOTE_DEBOUNCE_MS);
    });

    expect(result.current.isQuoteLoading).toBe(false);
    expect(result.current.settledAmount).toBe('1');
  });
});
