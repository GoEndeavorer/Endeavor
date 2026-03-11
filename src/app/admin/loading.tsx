export default function AdminLoading() {
  return (
    <div className="min-h-screen">
      <div className="h-16 border-b border-medium-gray/30 bg-black/95" />
      <main className="mx-auto max-w-5xl px-4 pt-24 pb-16">
        <div className="mb-6 h-8 w-48 animate-pulse bg-medium-gray/10" />
        <div className="mb-6 flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-9 w-28 animate-pulse bg-medium-gray/10" />
          ))}
        </div>
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 w-full animate-pulse bg-medium-gray/10" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 w-full animate-pulse bg-medium-gray/10" />
          ))}
        </div>
      </main>
    </div>
  );
}
