export default function StoriesLoading() {
  return (
    <div className="min-h-screen">
      <div className="h-16 border-b border-medium-gray/30 bg-black/95" />
      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <div className="mb-8 h-8 w-48 animate-pulse bg-medium-gray/10" />
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-medium-gray/10 p-6">
              <div className="mb-3 h-6 w-2/3 animate-pulse bg-medium-gray/10" />
              <div className="mb-2 h-4 w-full animate-pulse bg-medium-gray/10" />
              <div className="mb-2 h-4 w-full animate-pulse bg-medium-gray/10" />
              <div className="h-4 w-1/2 animate-pulse bg-medium-gray/10" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
