function Shimmer({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-white/10 ${className ?? ''}`} />
  );
}

export function QuoteSectionSkeleton() {
  return (
    <div className="flex h-full min-h-[15.75rem] flex-col overflow-hidden rounded-3xl border border-white/8 bg-white/[0.03]">
      <div className="p-4">
        <Shimmer className="mb-3 h-4 w-24" />
        <div className="flex items-center gap-3">
          <Shimmer className="h-9 flex-1" />
          <Shimmer className="h-10 w-28 shrink-0 rounded-2xl" />
        </div>
        <Shimmer className="mt-3 h-4 w-16" />
      </div>

      <div className="min-h-[5.5rem] flex-1 border-t border-white/8 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <Shimmer className="h-4 w-24" />
          <Shimmer className="h-4 w-40" />
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <Shimmer className="h-4 w-20" />
          <Shimmer className="h-4 w-28" />
        </div>
        <Shimmer className="mt-2 h-4 w-56" />
      </div>
    </div>
  );
}
