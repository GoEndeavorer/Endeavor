export default function EndeavorLoading() {
  return (
    <div className="min-h-screen">
      <div className="h-16 border-b border-medium-gray/30 bg-black/95" />
      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <div className="mb-6 h-64 w-full animate-pulse bg-medium-gray/10" />
        <div className="mb-4 h-6 w-32 animate-pulse bg-medium-gray/10" />
        <div className="mb-2 h-10 w-3/4 animate-pulse bg-medium-gray/10" />
        <div className="mb-8 h-4 w-48 animate-pulse bg-medium-gray/10" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-4 w-full animate-pulse bg-medium-gray/10" />
            <div className="h-4 w-full animate-pulse bg-medium-gray/10" />
            <div className="h-4 w-2/3 animate-pulse bg-medium-gray/10" />
          </div>
          <div className="space-y-4">
            <div className="h-24 w-full animate-pulse bg-medium-gray/10" />
            <div className="h-24 w-full animate-pulse bg-medium-gray/10" />
          </div>
        </div>
      </main>
    </div>
  );
}
