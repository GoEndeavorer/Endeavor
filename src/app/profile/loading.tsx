export default function ProfileLoading() {
  return (
    <div className="min-h-screen">
      <div className="h-16 border-b border-medium-gray/30 bg-black/95" />
      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <div className="mb-8 flex items-start gap-4">
          <div className="h-16 w-16 shrink-0 animate-pulse bg-medium-gray/10" />
          <div className="flex-1 space-y-2">
            <div className="h-7 w-40 animate-pulse bg-medium-gray/10" />
            <div className="h-4 w-56 animate-pulse bg-medium-gray/10" />
            <div className="h-4 w-72 animate-pulse bg-medium-gray/10" />
          </div>
        </div>
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="h-4 w-16 animate-pulse bg-medium-gray/10" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-6 w-20 animate-pulse bg-medium-gray/10" />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-16 animate-pulse bg-medium-gray/10" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-6 w-20 animate-pulse bg-medium-gray/10" />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 w-full animate-pulse bg-medium-gray/10" />
          ))}
        </div>
      </main>
    </div>
  );
}
