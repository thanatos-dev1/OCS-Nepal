export default function CategoriesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <div className="h-3.5 w-10 bg-bg-subtle rounded animate-pulse" />
        <div className="w-3 h-3 rounded bg-bg-subtle animate-pulse" />
        <div className="h-3.5 w-20 bg-bg-subtle rounded animate-pulse" />
      </div>

      <div className="h-8 w-40 bg-bg-subtle rounded-md animate-pulse mb-2" />
      <div className="h-4 w-64 bg-bg-subtle rounded animate-pulse mb-6" />

      {/* Mobile chip strip skeleton */}
      <div className="md:hidden -mx-4 px-4 mb-6 overflow-hidden">
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-20 rounded-full bg-bg-subtle animate-pulse shrink-0" />
          ))}
        </div>
      </div>

      <div className="md:flex md:gap-8">
        {/* Sidebar skeleton */}
        <aside className="hidden md:block md:w-56 shrink-0">
          <div className="flex flex-col gap-1">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="h-9 rounded-lg bg-bg-subtle animate-pulse" />
            ))}
          </div>
        </aside>

        {/* Content skeleton */}
        <div className="flex-1 min-w-0">
          {/* Banner */}
          <div className="aspect-3/1 sm:aspect-4/1 rounded-xl bg-bg-subtle animate-pulse mb-6" />

          {/* Sub-categories */}
          <div className="h-3.5 w-40 bg-bg-subtle rounded animate-pulse mb-3" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-bg-subtle animate-pulse" />
            ))}
          </div>

          {/* Featured products */}
          <div className="flex items-center justify-between mb-4">
            <div className="h-3.5 w-36 bg-bg-subtle rounded animate-pulse" />
            <div className="h-3.5 w-16 bg-bg-subtle rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-xl bg-bg-subtle animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
