export function CardSkeleton() {
  return (
    <div className="flex flex-col border border-medium-gray/20 animate-pulse">
      <div className="h-36 bg-medium-gray/10" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-16 bg-medium-gray/10" />
          <div className="h-5 w-12 bg-medium-gray/10" />
        </div>
        <div className="h-6 w-3/4 bg-medium-gray/10" />
        <div className="h-4 w-1/3 bg-medium-gray/10" />
        <div className="space-y-1.5">
          <div className="h-4 w-full bg-medium-gray/10" />
          <div className="h-4 w-5/6 bg-medium-gray/10" />
        </div>
        <div className="flex gap-2 pt-2">
          <div className="h-5 w-20 bg-medium-gray/10" />
          <div className="h-5 w-16 bg-medium-gray/10" />
        </div>
        <div className="flex justify-between border-t border-medium-gray/10 pt-3">
          <div className="h-4 w-24 bg-medium-gray/10" />
          <div className="h-4 w-12 bg-medium-gray/10" />
        </div>
      </div>
    </div>
  );
}

export function CardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
