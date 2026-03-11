export default function NotificationsLoading() {
  return (
    <div className="min-h-screen">
      <div className="h-16 border-b border-medium-gray/30 bg-black/95" />
      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-8 w-40 animate-pulse bg-medium-gray/10" />
          <div className="h-8 w-24 animate-pulse bg-medium-gray/10" />
        </div>
        <div className="mb-4 flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 w-20 animate-pulse bg-medium-gray/10" />
          ))}
        </div>
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 w-full animate-pulse bg-medium-gray/10" />
          ))}
        </div>
      </main>
    </div>
  );
}
