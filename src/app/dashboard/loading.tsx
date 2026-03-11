export default function DashboardLoading() {
  return (
    <div className="min-h-screen">
      <div className="h-16 border-b border-medium-gray/30 bg-black/95" />
      <main className="mx-auto max-w-5xl px-4 pt-24 pb-16">
        {/* Greeting skeleton */}
        <div className="mb-8">
          <div className="h-8 w-64 animate-pulse bg-medium-gray/10 mb-2" />
          <div className="h-4 w-40 animate-pulse bg-medium-gray/10" />
        </div>

        {/* Stats row skeleton */}
        <div className="mb-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border border-medium-gray/20 p-4">
              <div className="h-3 w-20 animate-pulse bg-medium-gray/10 mb-3" />
              <div className="h-8 w-12 animate-pulse bg-medium-gray/10" />
            </div>
          ))}
        </div>

        {/* Endeavors skeleton */}
        <div className="mb-10">
          <div className="h-4 w-36 animate-pulse bg-medium-gray/10 mb-4" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 w-full animate-pulse bg-medium-gray/10" />
            ))}
          </div>
        </div>

        {/* Tasks skeleton */}
        <div className="mb-10">
          <div className="h-4 w-32 animate-pulse bg-medium-gray/10 mb-4" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-14 w-full animate-pulse bg-medium-gray/10" />
            ))}
          </div>
        </div>

        {/* Quick actions skeleton */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse bg-medium-gray/10" />
          ))}
        </div>
      </main>
    </div>
  );
}
