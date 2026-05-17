import { motion } from 'framer-motion';

export function SwapSkeleton() {
  return (
    <div className="w-full max-w-md animate-pulse rounded-[2rem] border border-white/10 bg-slate-950/70 p-6 shadow-2xl">
      <div className="mb-6 h-4 w-32 rounded-full bg-white/10" />
      <motion.div layout className="mb-2 h-8 w-48 rounded-full bg-white/10" />
      <div className="mb-6 h-4 w-56 rounded-full bg-white/5" />
      <div className="space-y-3">
        <motion.div layout className="h-36 rounded-3xl bg-white/5" />
        <motion.div layout className="mx-auto h-12 w-12 rounded-2xl bg-white/5" />
        <motion.div layout className="h-36 rounded-3xl bg-white/5" />
        <motion.div layout className="h-24 rounded-2xl bg-white/5" />
        <motion.div layout className="h-14 rounded-2xl bg-white/10" />
      </div>
    </div>
  );
}
