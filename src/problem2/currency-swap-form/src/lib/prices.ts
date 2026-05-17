import type { PriceEntry, Token } from '@types';

export function normalizePrices(entries: PriceEntry[]): Map<string, number> {
  const latest = new Map<string, PriceEntry>();

  for (const entry of entries) {
    const existing = latest.get(entry.currency);
    if (!existing || new Date(entry.date) > new Date(existing.date)) {
      latest.set(entry.currency, entry);
    }
  }

  return new Map(
    [...latest.entries()].map(([currency, entry]) => [currency, entry.price]),
  );
}

export function buildTokens(priceMap: Map<string, number>): Token[] {
  return [...priceMap.entries()]
    .map(([symbol, price]) => ({ symbol, price }))
    .sort((a, b) => a.symbol.localeCompare(b.symbol));
}

export function getExchangeRate(
  fromPrice: number,
  toPrice: number,
): number | null {
  if (fromPrice <= 0 || toPrice <= 0) return null;
  return fromPrice / toPrice;
}

export function convertAmount(
  amount: number,
  fromPrice: number,
  toPrice: number,
): number | null {
  if (amount <= 0 || fromPrice <= 0 || toPrice <= 0) return null;
  const result = (amount * fromPrice) / toPrice;
  if (!Number.isFinite(result) || result <= 0) return null;
  return result;
}
