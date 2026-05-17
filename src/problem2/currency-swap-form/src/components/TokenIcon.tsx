import { useEffect, useState } from 'react';
import { resolveTokenIcon } from '../lib/tokens';
import { cn } from '../lib/utils';

type TokenIconProps = {
  symbol: string;
  size?: 'sm' | 'md';
};

export function TokenIcon({ symbol, size = 'md' }: TokenIconProps) {
  const [iconUrl, setIconUrl] = useState<string | undefined>();
  const dimension = size === 'sm' ? 'h-6 w-6' : 'h-8 w-8';

  useEffect(() => {
    let cancelled = false;

    void resolveTokenIcon(symbol).then((url) => {
      if (!cancelled) {
        setIconUrl(url);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [symbol]);

  if (iconUrl) {
    return (
      <img
        src={iconUrl}
        alt=""
        className={cn(dimension, 'rounded-full object-cover ring-1 ring-white/10')}
      />
    );
  }

  return (
    <span
      className={cn(
        dimension,
        'inline-flex items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-[10px] font-bold text-white',
      )}
      aria-hidden
    >
      {symbol.slice(0, 2).toUpperCase()}
    </span>
  );
}
