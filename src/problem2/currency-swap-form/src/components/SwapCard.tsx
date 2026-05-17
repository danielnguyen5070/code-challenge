import { useState } from 'react';
import { useQuoteLoading } from '../hooks/useQuoteLoading';
import { QuoteSection } from './QuoteSection';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowDownUp, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import type { SwapFormValues, Token } from '../types';
import { convertAmount, getExchangeRate } from '../lib/prices';
import {
  formatAmount,
  formatAmountForInput,
  formatRate,
  parseAmountInput,
  sanitizeAmountInput,
} from '../lib/format';
import { getMockBalance } from '../lib/tokens';
import { swapSchema } from '../lib/validation';
import { cn } from '../lib/utils';
import { CurrencyField } from './CurrencyField';

const DEFAULT_FROM = 'ETH';
const DEFAULT_TO = 'USDC';
const SUBMIT_DELAY_MS = 1800;

type SwapCardProps = {
  tokens: Token[];
  priceMap: Map<string, number>;
};

export function SwapCard({ tokens, priceMap }: SwapCardProps) {
  const [fromSymbol, setFromSymbol] = useState(DEFAULT_FROM);
  const [toSymbol, setToSymbol] = useState(DEFAULT_TO);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastEdited, setLastEdited] = useState<'from' | 'to'>('from');

  const {
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<SwapFormValues>({
    resolver: zodResolver(swapSchema),
    defaultValues: {
      fromSymbol: DEFAULT_FROM,
      toSymbol: DEFAULT_TO,
      fromAmount: '',
    },
    mode: 'onTouched',
  });

  const fromAmount = watch('fromAmount');
  const { showQuoteSkeleton, settledAmount, isQuoteLoading } =
    useQuoteLoading(fromAmount);

  const fromPrice = priceMap.get(fromSymbol) ?? 0;
  const toPrice = priceMap.get(toSymbol) ?? 0;
  const parsedFromAmount = parseAmountInput(fromAmount) ?? 0;
  const parsedSettledAmount = parseAmountInput(settledAmount) ?? 0;
  const receiveAmount = convertAmount(parsedSettledAmount, fromPrice, toPrice);
  const rate = getExchangeRate(fromPrice, toPrice);
  const fromUsd = parsedFromAmount > 0 ? parsedFromAmount * fromPrice : null;
  const toUsd =
    receiveAmount != null && receiveAmount > 0
      ? receiveAmount * toPrice
      : null;
  const fromBalance = getMockBalance(fromSymbol);

  const receiveDisplay =
    receiveAmount != null && receiveAmount > 0
      ? formatAmount(receiveAmount)
      : '';

  const rateLabel =
    rate != null && parsedSettledAmount > 0
      ? `1 ${fromSymbol} ≈ ${formatRate(rate)} ${toSymbol}`
      : null;

  function syncSymbols(nextFrom: string, nextTo: string) {
    setFromSymbol(nextFrom);
    setToSymbol(nextTo);
    setValue('fromSymbol', nextFrom, { shouldValidate: true });
    setValue('toSymbol', nextTo, { shouldValidate: true });
  }

  function resetPayAmount() {
    setValue('fromAmount', '', { shouldValidate: false, shouldTouch: false });
    clearErrors('fromAmount');
    setLastEdited('from');
  }

  function handleFlip() {
    const nextFrom = toSymbol;
    const nextTo = fromSymbol;

    const currentReceive = convertAmount(
      parsedSettledAmount > 0 ? parsedSettledAmount : parsedFromAmount,
      fromPrice,
      toPrice,
    );

    syncSymbols(nextFrom, nextTo);

    const newPayAmount =
      currentReceive != null && currentReceive > 0
        ? formatAmountForInput(currentReceive)
        : '';

    setValue('fromAmount', newPayAmount, {
      shouldValidate: Boolean(newPayAmount),
      shouldTouch: Boolean(newPayAmount),
    });
    clearErrors();
    setLastEdited('from');
  }

  function handleFromSymbolChange(symbol: string) {
    const fromChanged = symbol !== fromSymbol;

    if (symbol === toSymbol) {
      syncSymbols(symbol, fromSymbol);
      if (fromChanged) resetPayAmount();
      return;
    }

    syncSymbols(symbol, toSymbol);
    clearErrors('toSymbol');
    if (fromChanged) resetPayAmount();
  }

  function handleToSymbolChange(symbol: string) {
    if (symbol === fromSymbol) {
      syncSymbols(toSymbol, symbol);
      return;
    }
    syncSymbols(fromSymbol, symbol);
    clearErrors('toSymbol');
  }

  function handleMax() {
    const maxValue = sanitizeAmountInput(String(fromBalance));
    setValue('fromAmount', maxValue, { shouldValidate: true, shouldTouch: true });
    setLastEdited('from');
  }

  async function onSubmit(values: SwapFormValues) {
    if (values.fromSymbol === values.toSymbol) {
      setError('toSymbol', { message: 'Choose two different tokens' });
      return;
    }

    setIsSubmitting(true);

    await new Promise((resolve) => {
      window.setTimeout(resolve, SUBMIT_DELAY_MS);
    });

    setIsSubmitting(false);

    toast.success(
      `Swapped ${values.fromAmount} ${values.fromSymbol} → ${receiveDisplay} ${toSymbol}`,
      { duration: 4500 },
    );

    setValue('fromAmount', '', { shouldValidate: false });
    setLastEdited('from');
  }

  const formDisabled = isSubmitting;
  const canSubmit =
    parsedFromAmount > 0 &&
    parsedFromAmount <= fromBalance &&
    fromSymbol !== toSymbol &&
    receiveAmount != null &&
    !isSubmitting &&
    !isQuoteLoading;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-md"
    >
      <motion.div
        layout
        className="pointer-events-none absolute -inset-8 rounded-[2rem] bg-gradient-to-br from-violet-500/25 via-transparent to-cyan-400/20 blur-3xl"
        aria-hidden
      />

      <motion.div
        layout
        className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:p-6"
      >
        <motion.header layout className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Swap tokens
            </h1>
            <p className="mt-1 text-sm text-white/45">
              Exchange assets instantly with real-time pricing.
            </p>
          </div>
        </motion.header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <motion.div layout>
            <CurrencyField
              label="You pay"
              amount={fromAmount}
              onAmountChange={(value) => {
                setValue('fromAmount', value, {
                  shouldValidate: true,
                  shouldTouch: true,
                });
                setLastEdited('from');
              }}
              symbol={fromSymbol}
              onSymbolChange={handleFromSymbolChange}
              tokens={tokens}
              usdValue={fromUsd}
              balance={fromBalance}
              onMax={handleMax}
              error={errors.fromAmount?.message}
              disabled={formDisabled}
            />
          </motion.div>

          <div className="relative z-10 flex justify-center py-1">
            <div className="rounded-full bg-slate-950 p-1.5 ring-1 ring-white/10">
              <motion.button
                type="button"
                layout
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92, rotate: 180 }}
                onClick={handleFlip}
                disabled={formDisabled}
                className={cn(
                  'group flex h-10 w-10 items-center justify-center rounded-full',
                  'bg-gradient-to-br from-violet-500/20 to-cyan-500/20',
                  'text-violet-200 ring-1 ring-inset ring-white/15',
                  'shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_8px_24px_rgba(0,0,0,0.35)]',
                  'transition-[box-shadow,background-color,color] duration-200',
                  'hover:from-violet-500/35 hover:to-cyan-500/35 hover:text-white hover:ring-violet-400/40',
                  'disabled:pointer-events-none disabled:opacity-40',
                )}
                aria-label="Flip swap direction"
              >
                <ArrowDownUp className="h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110" />
              </motion.button>
            </div>
            </div>

          <QuoteSection
            loading={showQuoteSkeleton}
            receiveDisplay={receiveDisplay}
            toSymbol={toSymbol}
            onToSymbolChange={handleToSymbolChange}
            tokens={tokens}
            toUsd={toUsd}
            rateLabel={rateLabel}
            showHint={lastEdited === 'from' && parsedSettledAmount > 0}
            toSymbolError={errors.toSymbol?.message}
            disabled={formDisabled}
          />

          <motion.button
            layout
            type="submit"
            disabled={!canSubmit}
            className={cn(
              'mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-semibold text-white transition',
              canSubmit
                ? 'bg-gradient-to-r from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/25 hover:brightness-110'
                : 'cursor-not-allowed bg-white/10 text-white/35',
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Confirming swap…
              </>
            ) : (
              'Confirm swap'
            )}
          </motion.button>
        </form>
      </motion.div>
    </motion.section>
  );
}
