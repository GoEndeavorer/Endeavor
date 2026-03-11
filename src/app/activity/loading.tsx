export default function ActivityLoading() {
  return (
    <div className="min-h-screen">
      <div className="h-16 border-b border-medium-gray/30 bg-black/95" />
      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <div className="mb-8 h-8 w-56 animate-pulse bg-medium-gray/10" />
        <div className="mb-6 flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-24 animate-pulse bg-medium-gray/10" />
          ))}
        </div>
        <div className="space-y-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-16 w-full animate-pulse bg-medium-gray/10" />
          ))}
        </div>
      </main>
    </div>
  );
}
