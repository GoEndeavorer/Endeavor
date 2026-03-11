export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-24 pb-16">
      <div className="mb-6 h-8 w-32 animate-pulse bg-medium-gray/10" />
      <div className="mb-8 h-12 w-full animate-pulse bg-medium-gray/10" />
      <div className="mb-6 flex gap-4 border-b border-medium-gray/20 pb-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-4 w-20 animate-pulse bg-medium-gray/10" />
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse border border-medium-gray/20 p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-16 bg-medium-gray/10 shrink-0" />
              <div className="flex-1">
                <div className="mb-2 h-4 w-48 bg-medium-gray/10" />
                <div className="h-3 w-32 bg-medium-gray/10" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
