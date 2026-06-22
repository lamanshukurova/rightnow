// Skeleton loaders — shown while live weather is fetched and while a fresh
// set of recommendations is being assembled, so the UI never flashes empty.

export function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-xl2 border border-line bg-card shadow-card">
      <div className="skeleton h-40 w-full" />
      <div className="space-y-3 p-5">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-5 w-3/4 rounded" />
        <div className="space-y-2 pt-1">
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-full rounded" />
          <div className="skeleton h-3 w-2/3 rounded" />
        </div>
        <div className="flex gap-2 pt-3">
          <div className="skeleton h-9 flex-1 rounded-lg" />
          <div className="skeleton h-9 flex-1 rounded-lg" />
          <div className="skeleton h-9 w-11 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonWeather() {
  return (
    <div className="skeleton inline-flex h-10 w-56 rounded-full" aria-hidden="true" />
  );
}
