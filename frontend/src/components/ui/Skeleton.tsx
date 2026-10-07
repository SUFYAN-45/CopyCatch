export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`shimmer rounded-xl ${className}`} />;
}

export function AnalysisSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header bar skeleton */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-8 w-36 rounded-lg" />
      </div>

      {/* Main score container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 surface-card rounded-2xl p-6 flex flex-col items-center justify-center min-h-[220px]">
          <Skeleton className="size-36 rounded-full" />
        </div>
        <div className="lg:col-span-7 surface-card rounded-2xl p-6 space-y-5 justify-center flex flex-col min-h-[220px]">
          <Skeleton className="h-8 w-full rounded-lg" />
          <Skeleton className="h-8 w-full rounded-lg" />
          <Skeleton className="h-8 w-full rounded-lg" />
        </div>
      </div>

      {/* Match cards */}
      <div className="space-y-3 pt-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
    </div>
  );
}
