## Features

- **Live pricing** — Fetches token prices from the interview API and deduplicates by latest timestamp
- **Instant quotes** — Receive amount updates from `(pay × fromPrice) / toPrice`
- **Debounced input** — Pay amount is debounced (~450ms) with a skeleton loader while the quote recalculates
- **Token picker** — Searchable dropdown with lazy-loaded SVG icons from `src/assets/tokens/`
- **Flip direction** — Swap button exchanges tokens and moves the current receive amount into **You pay**
- **Validation** — Required amount, balance check (mock), and different-token enforcement via Zod + React Hook Form
- **Mock submit** — Confirm swap shows a loading state (~1.8s) then a success toast
- **Polished UX** — Dark DeFi-style layout, stable quote-zone height, input sanitization, and portaled receive dropdown (no clipping)

## Tech Stack

- **Build** — [Vite](https://vitejs.dev/) 8
- **UI** — React 19, Tailwind CSS 4, Framer Motion
- **Forms** — React Hook Form, Zod, `@hookform/resolvers`
- **Feedback** — React Hot Toast, Lucide React

## Path aliases

Imports use `@/` prefixes (configured in `tsconfig.app.json` and `vite.config.ts`):

| Alias | Maps to |
|-------|---------|
| `@components/*` | `src/components/*` |
| `@hooks/*` | `src/hooks/*` |
| `@lib/*` | `src/lib/*` |
| `@services` | `src/services` |
| `@types` | `src/types` |
| `@/*` | `src/*` |

Example: `import { getQuote } from '@services'` instead of `../../services`.

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & run

```bash
cd currency-swap-form
npm install
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

### Other scripts

```bash
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint
npm run test     # Vitest (watch)
npm run test:run # Vitest (CI)
```

## Project Structure

```
src/
├── components/
│   ├── common/                # TokenIcon, TokenPicker, CurrencyField
│   └── swap/                  # SwapCard, QuoteSection, skeletons
├── services/                  # App operations (fetch, quote, swap)
├── hooks/                     # React state & debounce
├── lib/                       # Pure helpers (no service imports)
├── types/                     # token, market, quote, swap types
└── assets/tokens/             # Token SVG images
```

## Design Decisions

### USD as the conversion bridge

The interview API returns **one USD price per token**, not direct pair rates (e.g. ETH/USDC). Quotes therefore use:

```
receive = (payAmount × fromUsdPrice) / toUsdPrice
```

This matches how many aggregators work when only USD marks are available. Tradeoff: assumes prices are consistent and simultaneous; there is no slippage or pool depth model.

### Layered architecture

| Layer | Responsibility |
|-------|----------------|
| **components** | UI and user events only |
| **hooks** | React lifecycle, debounce, loading flags |
| **services** | Named operations: fetch market, quote, execute swap |
| **lib** | Pure functions (math, format, validation) — no imports from `services` |
| **types** | Shared contracts, grouped by domain (`token`, `market`, `quote`, `swap`) |

`tokenService` is a thin facade over `lib/tokens` so UI code does not depend on implementation details. Validation uses `getMockBalance` from `lib/tokens` directly to keep `lib` independent of `services`.

### Debounced quotes (~450ms)

Pay amount updates on every keystroke, but **receive amount and exchange rate** use a debounced value (`useQuoteLoading`). This reduces flicker and unnecessary recalculations while typing. Pay-side USD can still update immediately from the live input. A fixed-height quote zone plus skeleton overlay prevents layout shift during the debounce window.

### Mock wallet and submit

Balances are **deterministic mocks** (`getMockBalance`) so MAX and validation work without a wallet. Submit calls `swapService.executeSwap`, which only simulates latency and returns a toast — no backend or chain. In production, balances would come from a wallet/RPC and submit would call a swap API or contract.

### Receive field is read-only

Users edit **You pay** only; **You receive** is derived from prices. This avoids conflicting bidirectional edits and matches typical swap UX. The receive token picker still allows changing the output asset.

### Portaled token menu on receive

The receive field sits inside cards with `overflow-hidden`. The receive `TokenPicker` uses a React **portal** to `document.body` so the dropdown is not clipped. Pay-side picker uses inline positioning (no clipping there).

### Input limits (12 integer / 8 decimal digits)

Caps prevent huge strings, layout breakage, and unsafe `Number` precision issues in the demo. Sanitization runs on change and paste; validation uses the same `parseAmountInput` helper.

### Token icons via Vite glob

Icons are loaded with `import.meta.glob` from `assets/tokens/`. This gives correct URLs in dev and build but increases bundle size when many SVGs are included. A production app would likely use a CDN or lazy-load icons on first open of the picker.

## CI

GitHub Actions runs on push/PR when files under `currency-swap-form` change:

- **Lint** — `npm run lint`
- **Test** — `npm run test:run` (Vitest + Testing Library)
- **Build** — `npm run build` (TypeScript + Vite)

Workflow file: `.github/workflows/currency-swap-form.yml` at the repository root.

```bash
# Run the same checks locally
npm run lint && npm run build
```

## External API

Prices are loaded from:

```
https://interview.switcheo.com/prices.json
```

Only tokens with a price entry are shown. Exchange rates are derived from USD prices:

```
receive = (payAmount × fromTokenUsdPrice) / toTokenUsdPrice
```

## Notes

- Wallet balances are **mocked** for demo purposes (`MAX` uses a deterministic balance per token).
- Submit does not call a real backend; it simulates latency and shows a toast.
- Pay input is limited to **12 integer digits** and **8 decimal places** to avoid overflow and layout issues.

## Production next steps

- Unit tests for `lib/prices`, `lib/format`, and `quoteService`
- Price refetch / stale indicators and retry on API failure
- Environment-based API URL (`VITE_PRICES_API_URL`)
- Decimal-safe arithmetic for financial amounts
- Smaller icon strategy (CDN or lazy load) to reduce bundle size

## License

Private — submission for code challenge purposes.
