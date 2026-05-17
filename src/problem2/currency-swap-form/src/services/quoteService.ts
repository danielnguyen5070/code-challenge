import { convertAmount, getExchangeRate } from '@lib/prices';
import type { QuoteInput, QuoteResult } from '@types';

export function getQuote({
  payAmount,
  fromPrice,
  toPrice,
}: QuoteInput): QuoteResult {
  const receiveAmount = convertAmount(payAmount, fromPrice, toPrice);
  const rate = getExchangeRate(fromPrice, toPrice);

  const fromUsd = payAmount > 0 ? payAmount * fromPrice : null;
  const toUsd =
    receiveAmount != null && receiveAmount > 0
      ? receiveAmount * toPrice
      : null;

  return { receiveAmount, rate, fromUsd, toUsd };
}
