export default function DashboardLoading() {
  return (
    <div className="min-h-screen">
      <div className="h-16 border-b border-medium-gray/30 bg-black/95" />
      <main className="mx-auto max-w-6xl px-4 pt-24 pb-16">
        <div className="mb-6 flex gap-2 overflow-hidden">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-10 w-24 flex-shrink-0 animate-pulse bg-medium-gray/10" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 w-full animate-pulse bg-medium-gray/10" />
            ))}
          </div>
          <div className="lg:col-span-2 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 w-full animate-pulse bg-medium-gray/10" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
