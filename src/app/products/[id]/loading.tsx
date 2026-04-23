export default function ProductLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-3.5 rounded bg-bg-subtle animate-pulse" style={{ width: `${40 + i * 10}px` }} />
            {i < 3 && <div className="w-3 h-3 rounded bg-bg-subtle animate-pulse" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Image */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl bg-bg-subtle animate-pulse" />
        </div>

        {/* Details */}
        <div>
          <div className="h-6 w-20 bg-bg-subtle rounded-md animate-pulse mb-3" />
          <div className="h-8 w-4/5 bg-bg-subtle rounded-md animate-pulse" />
          <div className="h-6 w-2/5 bg-bg-subtle rounded-md animate-pulse mt-1" />

          <div className="mt-5 h-9 w-40 bg-bg-subtle rounded-md animate-pulse" />
          <div className="mt-3 h-4 w-20 bg-bg-subtle rounded animate-pulse" />

          <div className="mt-6 space-y-2">
            <div className="h-3.5 w-full bg-bg-subtle rounded animate-pulse" />
            <div className="h-3.5 w-5/6 bg-bg-subtle rounded animate-pulse" />
            <div className="h-3.5 w-4/6 bg-bg-subtle rounded animate-pulse" />
          </div>

          <div className="mt-8 flex gap-3">
            <div className="h-11 flex-1 bg-bg-subtle rounded-lg animate-pulse" />
            <div className="h-11 w-11 bg-bg-subtle rounded-lg animate-pulse" />
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3 pt-6 border-t border-border">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div className="w-5 h-5 rounded bg-bg-subtle animate-pulse" />
                <div className="h-3 w-16 rounded bg-bg-subtle animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Specs */}
      <div className="mt-14">
        <div className="h-6 w-32 bg-bg-subtle rounded animate-pulse mb-4" />
        <div className="border border-border rounded-xl overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`flex items-center px-5 py-3.5 gap-8 ${i % 2 === 0 ? "bg-bg-card" : "bg-bg-subtle"}`}>
              <div className="h-3.5 w-32 bg-bg-subtle rounded animate-pulse shrink-0" />
              <div className="h-3.5 bg-bg-subtle rounded animate-pulse" style={{ width: `${80 + i * 20}px` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
