import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, Search } from 'lucide-react';
import { formatUsd } from '@lib/format';
import { cn } from '@lib/utils';
import type { Token } from '@types';
import { TokenIcon } from './TokenIcon';

const MENU_WIDTH_PX = 288;

type TokenPickerProps = {
  tokens: Token[];
  value: string;
  onChange: (symbol: string) => void;
  disabled?: boolean;
  /** Render menu in a portal so parent overflow-hidden does not clip it */
  portaled?: boolean;
};

export function TokenPicker({
  tokens,
  value,
  onChange,
  disabled = false,
  portaled = false,
}: TokenPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selected = tokens.find((token) => token.symbol === value);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return tokens;
    return tokens.filter((token) =>
      token.symbol.toLowerCase().includes(normalized),
    );
  }, [query, tokens]);

  useEffect(() => {
    if (!open || !portaled) {
      return;
    }

    function updatePosition() {
      const button = buttonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const left = Math.min(
        Math.max(8, rect.right - MENU_WIDTH_PX),
        window.innerWidth - MENU_WIDTH_PX - 8,
      );

      setMenuPosition({
        top: rect.bottom + 8,
        left,
      });
    }

    const frame = requestAnimationFrame(updatePosition);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, portaled]);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const menuContent = (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.16 }}
      className={cn(
        'w-72 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl shadow-black/40 backdrop-blur-xl',
        portaled ? 'fixed z-[9999]' : 'absolute right-0 z-50 mt-2',
      )}
      style={
        portaled && menuPosition
          ? { top: menuPosition.top, left: menuPosition.left, width: MENU_WIDTH_PX }
          : undefined
      }
    >
      <div className="border-b border-white/10 p-3">
        <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-white/40" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search token"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
            autoFocus
          />
        </div>
      </div>

      <ul className="max-h-64 overflow-y-auto p-2" role="listbox">
        {filtered.length === 0 ? (
          <li className="px-3 py-6 text-center text-sm text-white/45">
            No tokens found
          </li>
        ) : (
          filtered.map((token) => {
            const isSelected = token.symbol === value;
            return (
              <li key={token.symbol}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(token.symbol);
                    setOpen(false);
                    setQuery('');
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition',
                    isSelected
                      ? 'bg-violet-500/20 text-white'
                      : 'text-white/80 hover:bg-white/5',
                  )}
                >
                  <span className="flex items-center gap-3">
                    <TokenIcon symbol={token.symbol} size="sm" />
                    <span>
                      <span className="block text-sm font-semibold">
                        {token.symbol}
                      </span>
                      <span className="block text-xs text-white/45">
                        {formatUsd(token.price)}
                      </span>
                    </span>
                  </span>
                  {isSelected && (
                    <Check className="h-4 w-4 shrink-0 text-violet-300" />
                  )}
                </button>
              </li>
            );
          })
        )}
      </ul>
    </motion.div>
  );

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          'flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/15',
          disabled && 'cursor-not-allowed opacity-60',
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <TokenIcon symbol={selected?.symbol ?? value} size="sm" />
        <span>{selected?.symbol ?? value}</span>
        <ChevronDown
          className={cn('h-4 w-4 text-white/60 transition', open && 'rotate-180')}
        />
      </button>

      {portaled ? (
        typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {open && menuPosition && menuContent}
          </AnimatePresence>,
          document.body,
        )
      ) : (
        <AnimatePresence>{open && menuContent}</AnimatePresence>
      )}
    </div>
  );
}
