const iconLoaders = import.meta.glob<string>('../assets/tokens/*.svg', {
  query: '?url',
  import: 'default',
});

const SYMBOL_ALIASES: Record<string, string> = {
  STEVMOS: 'stEVMOS',
  STATOM: 'stATOM',
  STLUNA: 'stLUNA',
  STOSMO: 'stOSMO',
};

const iconPathBySymbol = new Map<string, string>();

for (const path of Object.keys(iconLoaders)) {
  const fileName = path.split('/').pop()?.replace('.svg', '');
  if (fileName) {
    iconPathBySymbol.set(fileName, path);
    iconPathBySymbol.set(fileName.toLowerCase(), path);
  }
}

function candidatePaths(symbol: string): string[] {
  const names = [symbol, SYMBOL_ALIASES[symbol]].filter(
    (name): name is string => Boolean(name),
  );

  return names.flatMap((name) => {
    const direct = `../assets/tokens/${name}.svg`;
    const resolved = iconPathBySymbol.get(name) ?? iconPathBySymbol.get(name.toLowerCase());
    return resolved ? [resolved] : [direct];
  });
}

const iconCache = new Map<string, string | undefined>();

export async function resolveTokenIcon(
  symbol: string,
): Promise<string | undefined> {
  if (iconCache.has(symbol)) {
    return iconCache.get(symbol);
  }

  for (const path of candidatePaths(symbol)) {
    const loader = iconLoaders[path];
    if (loader) {
      const url = await loader();
      iconCache.set(symbol, url);
      return url;
    }
  }

  iconCache.set(symbol, undefined);
  return undefined;
}

/** Deterministic mock balance for demo UX */
export function getMockBalance(symbol: string): number {
  let hash = 0;
  for (let i = 0; i < symbol.length; i += 1) {
    hash = (hash * 31 + symbol.charCodeAt(i)) % 9973;
  }
  const base = 0.5 + (hash % 500) / 100;
  return Number(base.toFixed(4));
}
