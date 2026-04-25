export default function CategoriesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8">
        <div className="h-3.5 w-10 bg-bg-subtle rounded animate-pulse" />
        <div className="w-3 h-3 rounded bg-bg-subtle animate-pulse" />
        <div className="h-3.5 w-20 bg-bg-subtle rounded animate-pulse" />
      </div>

      <div className="h-8 w-40 bg-bg-subtle rounded-md animate-pulse mb-2" />
      <div className="h-4 w-64 bg-bg-subtle rounded animate-pulse mb-8" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-5 p-5 bg-bg-card border border-border rounded-xl">
            <div className="w-14 h-14 rounded-lg bg-bg-subtle animate-pulse shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-bg-subtle rounded animate-pulse" />
              <div className="h-3.5 w-1/3 bg-bg-subtle rounded animate-pulse" />
            </div>
            <div className="w-4 h-4 rounded bg-bg-subtle animate-pulse shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
