export default function SettingsLoading() {
  return (
    <div className="min-h-screen">
      <div className="h-16 border-b border-medium-gray/30 bg-black/95" />
      <main className="mx-auto max-w-xl px-4 pt-24 pb-16">
        <div className="mb-8 h-8 w-48 animate-pulse bg-medium-gray/10" />
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="h-4 w-16 animate-pulse bg-medium-gray/10" />
            <div className="h-12 w-full animate-pulse bg-medium-gray/10" />
          </div>
          <div className="space-y-3">
            <div className="h-4 w-24 animate-pulse bg-medium-gray/10" />
            <div className="h-12 w-full animate-pulse bg-medium-gray/10" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 w-full animate-pulse bg-medium-gray/10" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
