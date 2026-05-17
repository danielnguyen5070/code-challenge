import { motion } from 'framer-motion';
import {
  formatUsd,
  isAmountAtIntegerLimit,
  sanitizeAmountInput,
} from '@lib/format';
import { cn } from '@lib/utils';
import type { Token } from '@types';
import { TokenPicker } from './TokenPicker';

type CurrencyFieldProps = {
  label: string;
  amount: string;
  onAmountChange?: (value: string) => void;
  symbol: string;
  onSymbolChange: (symbol: string) => void;
  tokens: Token[];
  usdValue?: number | null;
  balance?: number;
  onMax?: () => void;
  readOnlyAmount?: boolean;
  error?: string;
  disabled?: boolean;
  variant?: 'card' | 'embedded';
  portaledTokenPicker?: boolean;
};

export function CurrencyField({
  label,
  amount,
  onAmountChange,
  symbol,
  onSymbolChange,
  tokens,
  usdValue,
  balance,
  onMax,
  readOnlyAmount = false,
  error,
  disabled = false,
  variant = 'card',
  portaledTokenPicker = false,
}: CurrencyFieldProps) {
  const isEmbedded = variant === 'embedded';

  return (
    <div
      className={cn(
        isEmbedded ? 'p-4' : 'rounded-3xl border bg-white/[0.03] p-4 transition',
        !isEmbedded &&
          (error
            ? 'border-rose-400/50 ring-1 ring-rose-400/20'
            : 'border-white/8 hover:border-white/14'),
      )}
    >
      <motion.div layout className="mb-3 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-white/55">{label}</span>
        {balance !== undefined && (
          <motion.div layout className="flex items-center gap-2 text-xs text-white/45">
            <span>Balance: {balance.toFixed(4)}</span>
            {onMax && (
              <button
                type="button"
                onClick={onMax}
                disabled={disabled}
                className="rounded-md bg-violet-500/20 px-2 py-0.5 font-semibold text-violet-200 transition hover:bg-violet-500/30 disabled:opacity-50"
              >
                MAX
              </button>
            )}
          </motion.div>
        )}
      </motion.div>

      <motion.div layout className="flex items-center gap-3">
        <input
          type="text"
          inputMode="decimal"
          value={amount}
          readOnly={readOnlyAmount}
          disabled={disabled || readOnlyAmount}
          onChange={(event) => {
            if (!onAmountChange) return;
            onAmountChange(sanitizeAmountInput(event.target.value));
          }}
          onKeyDown={(event) => {
            if (readOnlyAmount || disabled) return;
            const allowedKeys = [
              'Backspace',
              'Delete',
              'Tab',
              'ArrowLeft',
              'ArrowRight',
              'ArrowUp',
              'ArrowDown',
              'Home',
              'End',
            ];
            if (allowedKeys.includes(event.key)) return;
            if (event.ctrlKey || event.metaKey) return;
            if (/^\d$/.test(event.key)) {
              if (!amount.includes('.') && isAmountAtIntegerLimit(amount)) {
                event.preventDefault();
              }
              return;
            }
            if (event.key === '.' && !amount.includes('.')) return;
            event.preventDefault();
          }}
          onPaste={(event) => {
            if (readOnlyAmount || disabled || !onAmountChange) return;
            event.preventDefault();
            const pasted = event.clipboardData.getData('text');
            onAmountChange(sanitizeAmountInput(pasted));
          }}
          placeholder="0.0"
          className={cn(
            'min-w-0 flex-1 truncate bg-transparent text-2xl font-semibold tracking-tight text-white outline-none placeholder:text-white/20 sm:text-3xl',
            readOnlyAmount && 'text-white/75',
          )}
          title={amount || undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${label}-error` : undefined}
        />
        <TokenPicker
          tokens={tokens}
          value={symbol}
          onChange={onSymbolChange}
          disabled={disabled}
          portaled={portaledTokenPicker}
        />
      </motion.div>

      <motion.div layout className="mt-3 flex items-center justify-between gap-3">
        <span className="min-w-0 truncate text-sm text-white/40">
          {usdValue != null ? formatUsd(usdValue) : '—'}
        </span>
        {error && (
          <p
            id={`${label}-error`}
            className="text-right text-xs font-medium text-rose-300"
          >
            {error}
          </p>
        )}
      </motion.div>
    </div>
  );
}
