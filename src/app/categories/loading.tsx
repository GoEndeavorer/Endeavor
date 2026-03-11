export default function CategoriesLoading() {
  return (
    <div className="min-h-screen">
      <div className="h-16 border-b border-medium-gray/30 bg-black/95" />
      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <div className="mb-2 h-8 w-56 animate-pulse bg-medium-gray/10" />
        <div className="mb-8 h-4 w-72 animate-pulse bg-medium-gray/10" />
        <div className="mb-8 grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse bg-medium-gray/10" />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse bg-medium-gray/10" />
          ))}
        </div>
      </main>
    </div>
  );
}
