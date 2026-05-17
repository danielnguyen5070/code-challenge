import { parseAmountInput } from '@lib/format';
import { useDebounce } from './useDebounce';

export const QUOTE_DEBOUNCE_MS = 450;

export function useQuoteLoading(
  fromAmount: string,
  delayMs = QUOTE_DEBOUNCE_MS,
) {
  const debouncedAmount = useDebounce(fromAmount, delayMs);

  const parsedInput = parseAmountInput(fromAmount);
  const needsQuote = parsedInput !== null && parsedInput > 0;
  const isQuoteLoading = needsQuote && fromAmount !== debouncedAmount;

  return {
    isQuoteLoading,
    showQuoteSkeleton: isQuoteLoading,
    settledAmount: debouncedAmount,
    debouncedAmount,
  };
}
