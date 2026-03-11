export default function PeopleLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-24 pb-16">
      <div className="mb-8">
        <div className="mb-2 h-8 w-32 animate-pulse bg-medium-gray/10" />
        <div className="h-4 w-64 animate-pulse bg-medium-gray/10" />
      </div>
      <div className="mb-6 flex gap-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-8 w-24 animate-pulse bg-medium-gray/10" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="animate-pulse border border-medium-gray/20 p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="h-10 w-10 bg-medium-gray/10" />
              <div>
                <div className="mb-1 h-4 w-28 bg-medium-gray/10" />
                <div className="h-3 w-20 bg-medium-gray/10" />
              </div>
            </div>
            <div className="mb-2 h-3 w-full bg-medium-gray/10" />
            <div className="h-3 w-3/4 bg-medium-gray/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
