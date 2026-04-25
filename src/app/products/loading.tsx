export default function ProductsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-8 w-36 bg-bg-subtle rounded-md animate-pulse" />
          <div className="h-4 w-20 bg-bg-subtle rounded-md animate-pulse mt-2" />
        </div>
        <div className="h-9 w-36 bg-bg-subtle rounded-md animate-pulse" />
      </div>

      <div className="flex gap-8">
        {/* Sidebar skeleton */}
        <aside className="hidden lg:block w-56 shrink-0">
          <div className="sticky top-24 space-y-6">
            <div className="h-4 w-16 bg-bg-subtle rounded animate-pulse" />
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded bg-bg-subtle animate-pulse" />
                  <div className="h-3.5 bg-bg-subtle rounded animate-pulse" style={{ width: `${60 + i * 15}px` }} />
                </div>
              ))}
            </div>
            <div className="pt-6 border-t border-border space-y-3">
              <div className="h-4 w-12 bg-bg-subtle rounded animate-pulse" />
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div className="w-4 h-4 rounded bg-bg-subtle animate-pulse" />
                  <div className="h-3.5 bg-bg-subtle rounded animate-pulse" style={{ width: `${50 + i * 20}px` }} />
                </div>
              ))}
            </div>
            <div className="pt-6 border-t border-border space-y-3">
              <div className="h-4 w-24 bg-bg-subtle rounded animate-pulse" />
              <div className="flex items-center gap-2">
                <div className="flex-1 h-9 bg-bg-subtle rounded-md animate-pulse" />
                <div className="w-4 h-4 bg-bg-subtle rounded animate-pulse shrink-0" />
                <div className="flex-1 h-9 bg-bg-subtle rounded-md animate-pulse" />
              </div>
            </div>
          </div>
        </aside>

        {/* Product grid skeleton */}
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border overflow-hidden bg-white">
                <div className="h-48 bg-bg-subtle animate-pulse" />
                <div className="p-4 space-y-2.5">
                  <div className="h-3 w-16 bg-bg-subtle rounded animate-pulse" />
                  <div className="h-4 w-3/4 bg-bg-subtle rounded animate-pulse" />
                  <div className="h-3.5 w-1/2 bg-bg-subtle rounded animate-pulse" />
                  <div className="flex items-center justify-between pt-1">
                    <div className="h-5 w-24 bg-bg-subtle rounded animate-pulse" />
                    <div className="h-8 w-20 bg-bg-subtle rounded-md animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
