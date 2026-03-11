export default function UserProfileLoading() {
  return (
    <div className="min-h-screen">
      <div className="h-16 border-b border-medium-gray/30 bg-black/95" />
      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <div className="mb-8 flex items-start gap-5">
          <div className="h-20 w-20 shrink-0 animate-pulse bg-medium-gray/10" />
          <div className="flex-1 space-y-3">
            <div className="h-7 w-48 animate-pulse bg-medium-gray/10" />
            <div className="h-4 w-32 animate-pulse bg-medium-gray/10" />
            <div className="h-4 w-64 animate-pulse bg-medium-gray/10" />
          </div>
        </div>
        <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse bg-medium-gray/10" />
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 w-full animate-pulse bg-medium-gray/10" />
          ))}
        </div>
      </main>
    </div>
  );
}
