export default function ExploreLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-24 pb-16">
      <div className="mb-2 h-8 w-32 animate-pulse bg-medium-gray/10" />
      <div className="mb-8 h-4 w-64 animate-pulse bg-medium-gray/10" />
      <div className="space-y-10">
        {[...Array(4)].map((_, i) => (
          <div key={i}>
            <div className="mb-4 h-4 w-28 animate-pulse bg-medium-gray/10" />
            <div className="flex flex-wrap gap-2">
              {[...Array(8)].map((_, j) => (
                <div key={j} className="h-9 w-24 animate-pulse bg-medium-gray/10" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
