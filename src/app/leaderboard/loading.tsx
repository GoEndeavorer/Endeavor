export default function LeaderboardLoading() {
  return (
    <div className="min-h-screen">
      <div className="h-16 border-b border-medium-gray/30 bg-black/95" />
      <main className="mx-auto max-w-2xl px-4 pt-24 pb-16">
        <div className="mb-2 h-8 w-48 animate-pulse bg-medium-gray/10" />
        <div className="mb-6 h-4 w-72 animate-pulse bg-medium-gray/10" />
        <div className="mb-6 flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-9 w-32 animate-pulse bg-medium-gray/10" />
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-16 w-full animate-pulse bg-medium-gray/10" />
          ))}
        </div>
      </main>
    </div>
  );
}
