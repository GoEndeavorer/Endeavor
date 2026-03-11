export default function ThreadLoading() {
  return (
    <div className="min-h-screen">
      <div className="h-16 border-b border-medium-gray/30 bg-black/95" />
      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        {/* Back link skeleton */}
        <div className="mb-6 h-4 w-40 animate-pulse bg-medium-gray/10" />

        {/* Top-level message skeleton */}
        <div className="mb-8 border border-medium-gray/20 p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse bg-medium-gray/20" />
            <div className="space-y-2">
              <div className="h-4 w-28 animate-pulse bg-medium-gray/10" />
              <div className="h-3 w-20 animate-pulse bg-medium-gray/10" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse bg-medium-gray/10" />
            <div className="h-4 w-3/4 animate-pulse bg-medium-gray/10" />
            <div className="h-4 w-1/2 animate-pulse bg-medium-gray/10" />
          </div>
          <div className="mt-4 flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-7 w-14 animate-pulse bg-medium-gray/10" />
            ))}
          </div>
        </div>

        {/* Replies heading skeleton */}
        <div className="mb-4 h-5 w-24 animate-pulse bg-medium-gray/10" />

        {/* Reply skeletons */}
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border border-medium-gray/20 p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="h-7 w-7 animate-pulse bg-medium-gray/20" />
                <div className="h-3 w-24 animate-pulse bg-medium-gray/10" />
                <div className="h-3 w-16 animate-pulse bg-medium-gray/10" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full animate-pulse bg-medium-gray/10" />
                <div className="h-3 w-2/3 animate-pulse bg-medium-gray/10" />
              </div>
            </div>
          ))}
        </div>

        {/* Reply form skeleton */}
        <div className="mt-8">
          <div className="h-24 w-full animate-pulse bg-medium-gray/10" />
          <div className="mt-2 h-9 w-28 animate-pulse bg-medium-gray/10" />
        </div>
      </main>
    </div>
  );
}
