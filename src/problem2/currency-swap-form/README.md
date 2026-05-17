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
```

## Project Structure

```
src/
├── components/
│   ├── SwapCard.tsx           # Main swap form
│   ├── CurrencyField.tsx      # Pay / receive amount fields
│   ├── TokenPicker.tsx        # Searchable token dropdown
│   ├── QuoteSection.tsx       # Receive + rate/fee zone
│   └── ...
├── hooks/
│   ├── useTokenPrices.ts      # Price API fetch
│   ├── useDebounce.ts         # Generic debounce hook
│   └── useQuoteLoading.ts     # Quote loading + debounced amount
├── lib/
│   ├── prices.ts              # Price normalization & conversion
│   ├── format.ts              # Formatting & input sanitization
│   ├── validation.ts          # Zod schema
│   └── tokens.ts              # Icon resolution & mock balances
└── assets/tokens/             # Token SVG images
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

## License

Private — submission for code challenge purposes.
