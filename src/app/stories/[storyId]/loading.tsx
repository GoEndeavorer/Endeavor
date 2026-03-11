export default function StoryLoading() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-24 pb-16">
      <div className="mb-8 border-b border-medium-gray/20 pb-8">
        <div className="mb-3 h-3 w-16 animate-pulse bg-medium-gray/10" />
        <div className="mb-4 h-8 w-3/4 animate-pulse bg-medium-gray/10" />
        <div className="flex gap-3">
          <div className="h-3 w-20 animate-pulse bg-medium-gray/10" />
          <div className="h-3 w-24 animate-pulse bg-medium-gray/10" />
          <div className="h-3 w-32 animate-pulse bg-medium-gray/10" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full animate-pulse bg-medium-gray/10" />
        <div className="h-4 w-full animate-pulse bg-medium-gray/10" />
        <div className="h-4 w-3/4 animate-pulse bg-medium-gray/10" />
        <div className="h-4 w-full animate-pulse bg-medium-gray/10" />
        <div className="h-4 w-5/6 animate-pulse bg-medium-gray/10" />
      </div>
    </div>
  );
}
