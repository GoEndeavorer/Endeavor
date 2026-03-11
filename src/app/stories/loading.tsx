export default function StoriesLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 pt-24 pb-16">
      <div className="mb-2 h-8 w-32 animate-pulse bg-medium-gray/10" />
      <div className="mb-8 h-4 w-64 animate-pulse bg-medium-gray/10" />
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse border border-medium-gray/20 p-5">
            <div className="mb-2 flex gap-2">
              <div className="h-3 w-24 bg-medium-gray/10" />
              <div className="h-3 w-16 bg-medium-gray/10" />
            </div>
            <div className="mb-2 h-5 w-64 bg-medium-gray/10" />
            <div className="mb-1 h-3 w-full bg-medium-gray/10" />
            <div className="h-3 w-3/4 bg-medium-gray/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
