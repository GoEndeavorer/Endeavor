export default function CreateEndeavorLoading() {
  return (
    <div className="min-h-screen">
      <div className="h-16 border-b border-medium-gray/30 bg-black/95" />
      <main className="mx-auto max-w-2xl px-4 pt-24 pb-16">
        <div className="mb-2 h-8 w-64 animate-pulse bg-medium-gray/10" />
        <div className="mb-8 h-4 w-80 animate-pulse bg-medium-gray/10" />
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="h-4 w-12 animate-pulse bg-medium-gray/10" />
            <div className="h-12 w-full animate-pulse bg-medium-gray/10" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 animate-pulse bg-medium-gray/10" />
            <div className="h-32 w-full animate-pulse bg-medium-gray/10" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-16 animate-pulse bg-medium-gray/10" />
            <div className="flex gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-8 w-20 animate-pulse bg-medium-gray/10" />
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-12 w-full animate-pulse bg-medium-gray/10" />
            <div className="h-12 w-full animate-pulse bg-medium-gray/10" />
          </div>
          <div className="h-12 w-full animate-pulse bg-medium-gray/10" />
          <div className="h-14 w-full animate-pulse bg-medium-gray/10" />
        </div>
      </main>
    </div>
  );
}
