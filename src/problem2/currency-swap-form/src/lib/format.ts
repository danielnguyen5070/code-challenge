const amountFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 8,
  minimumFractionDigits: 0,
});

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

const rateFormatter = new Intl.NumberFormat('en-US', {
  maximumSignificantDigits: 6,
});

export const MAX_AMOUNT_DECIMALS = 8;
export const MAX_AMOUNT_INTEGER_DIGITS = 12;

const MAX_AMOUNT_VALUE = 10 ** MAX_AMOUNT_INTEGER_DIGITS - 1;

export function formatAmount(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '0';
  if (value > MAX_AMOUNT_VALUE) {
    return amountFormatter.format(MAX_AMOUNT_VALUE);
  }
  return amountFormatter.format(value);
}

export function formatUsd(value: number): string {
  if (!Number.isFinite(value) || value < 0) return '—';
  if (value > Number.MAX_SAFE_INTEGER) return '—';
  return usdFormatter.format(value);
}

export function formatRate(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '0';
  return rateFormatter.format(value);
}

/** Keeps only valid partial decimal input while the user types. */
export function sanitizeAmountInput(
  raw: string,
  maxDecimals = MAX_AMOUNT_DECIMALS,
  maxIntegerDigits = MAX_AMOUNT_INTEGER_DIGITS,
): string {
  const stripped = raw.replace(/,/g, '').replace(/[^\d.]/g, '');
  if (stripped === '') return '';

  const dotIndex = stripped.indexOf('.');
  if (dotIndex === -1) {
    const digits = stripped.replace(/^0+(?=\d)/, '');
    const normalized = digits === '' ? '0' : digits;
    return normalized.slice(0, maxIntegerDigits);
  }

  const whole =
    stripped.slice(0, dotIndex).replace(/^0+(?=\d)/, '').slice(0, maxIntegerDigits) ||
    '0';
  const fraction = stripped
    .slice(dotIndex + 1)
    .replace(/\./g, '')
    .slice(0, maxDecimals);

  return `${whole}.${fraction}`;
}

export function parseAmountInput(raw: string): number | null {
  const trimmed = sanitizeAmountInput(raw.trim());
  if (trimmed === '' || trimmed === '.') return null;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value <= 0 || value > MAX_AMOUNT_VALUE) {
    return null;
  }
  return value;
}

/** Converts a numeric amount into a string suitable for the pay input field */
export function formatAmountForInput(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '';
  const clamped = Math.min(value, MAX_AMOUNT_VALUE);
  const raw = clamped.toLocaleString('en-US', {
    maximumFractionDigits: MAX_AMOUNT_DECIMALS,
    useGrouping: false,
  });
  return sanitizeAmountInput(raw);
}

export function isAmountAtIntegerLimit(amount: string): boolean {
  const whole = sanitizeAmountInput(amount).split('.')[0] ?? '';
  return whole.replace(/^0+/, '').length >= MAX_AMOUNT_INTEGER_DIGITS;
}
