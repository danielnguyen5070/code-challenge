import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { SwapCard } from './components/SwapCard';
import { SwapSkeleton } from './components/SwapSkeleton';
import { useTokenPrices } from './hooks/useTokenPrices';

export default function App() {
  const prices = useTokenPrices();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="relative min-h-screen overflow-hidden px-4 py-10 sm:py-14"
    >
      <motion.div
        layout
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(139,92,246,0.22),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(99,102,241,0.12),transparent_40%)]"
        aria-hidden
      />

      <main className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col items-center justify-center">
        {prices.status === 'loading' && <SwapSkeleton />}

        {prices.status === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md rounded-[2rem] border border-rose-400/30 bg-rose-500/10 p-6 text-center text-rose-100 backdrop-blur-xl"
          >
            <p className="text-lg font-semibold">Unable to load market data</p>
            <p className="mt-2 text-sm text-rose-100/70">{prices.message}</p>
          </motion.div>
        )}

        {prices.status === 'ready' && (
          <SwapCard tokens={prices.tokens} priceMap={prices.priceMap} />
        )}
      </main>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid rgba(255,255,255,0.08)',
          },
        }}
      />
    </motion.div>
  );
}
