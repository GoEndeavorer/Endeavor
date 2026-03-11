export default function HiringLoading() {
  return (
    <div className="min-h-screen">
      <div className="h-16 border-b border-medium-gray/30 bg-black/95" />
      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <div className="mb-2 h-8 w-40 animate-pulse bg-medium-gray/10" />
        <div className="mb-8 h-4 w-96 animate-pulse bg-medium-gray/10" />
        <div className="mb-6 flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-24 animate-pulse bg-medium-gray/10" />
          ))}
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 w-full animate-pulse bg-medium-gray/10" />
          ))}
        </div>
      </main>
    </div>
  );
}
