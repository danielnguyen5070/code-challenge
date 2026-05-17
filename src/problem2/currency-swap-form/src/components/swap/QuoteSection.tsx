import { CurrencyField } from '@components/common/CurrencyField';
import { cn } from '@lib/utils';
import type { Token } from '@types';
import { QuoteSectionSkeleton } from './QuoteSectionSkeleton';

/** Fixed height for the receive quote zone to prevent layout shift */
const QUOTE_SECTION_MIN_H = 'min-h-[15.75rem]';

type QuoteSectionProps = {
  loading: boolean;
  receiveDisplay: string;
  toSymbol: string;
  onToSymbolChange: (symbol: string) => void;
  tokens: Token[];
  toUsd: number | null;
  rateLabel: string | null;
  showHint: boolean;
  toSymbolError?: string;
  disabled?: boolean;
};

export function QuoteSection({
  loading,
  receiveDisplay,
  toSymbol,
  onToSymbolChange,
  tokens,
  toUsd,
  rateLabel,
  showHint,
  toSymbolError,
  disabled = false,
}: QuoteSectionProps) {
  return (
    <div className={cn('relative', QUOTE_SECTION_MIN_H)}>
      <div
        className={cn(
          'transition-opacity duration-150',
          QUOTE_SECTION_MIN_H,
          loading && 'pointer-events-none opacity-0',
        )}
        aria-hidden={loading}
      >
        <div
          className={cn(
            'rounded-3xl border bg-white/[0.03] transition',
            toSymbolError
              ? 'border-rose-400/50 ring-1 ring-rose-400/20'
              : 'border-white/8',
          )}
        >
          <CurrencyField
            variant="embedded"
            portaledTokenPicker
            label="You receive"
            amount={receiveDisplay}
            symbol={toSymbol}
            onSymbolChange={onToSymbolChange}
            tokens={tokens}
            usdValue={toUsd}
            readOnlyAmount
            error={toSymbolError}
            disabled={disabled}
          />

          <div className="min-h-[5.5rem] border-t border-white/8 px-4 py-3 text-sm">
            <div className="flex items-center justify-between gap-3 text-white/55">
              <span>Exchange rate</span>
              <span className="min-w-0 truncate text-right font-medium text-white/80">
                {rateLabel ?? '—'}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-white/45">
              <span>Network fee</span>
              <span className="font-medium text-emerald-300/90">
                Simulated · $0.00
              </span>
            </div>
            <p
              className={cn(
                'mt-2 min-h-[1rem] text-xs text-white/35',
                !showHint && 'invisible',
              )}
            >
              Output updates automatically from live USD prices.
            </p>
          </div>
        </div>
      </div>

      {loading && (
        <div
          className={cn('absolute inset-0 z-10', QUOTE_SECTION_MIN_H)}
          aria-busy
          aria-label="Calculating quote"
        >
          <QuoteSectionSkeleton />
        </div>
      )}
    </div>
  );
}
