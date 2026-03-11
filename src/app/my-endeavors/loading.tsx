import { CardSkeletonGrid } from "@/components/skeleton";

export default function MyEndeavorsLoading() {
  return (
    <div className="min-h-screen">
      <div className="h-16 border-b border-medium-gray/30 bg-black/95" />
      <main className="mx-auto max-w-6xl px-4 pt-24 pb-16">
        <div className="mb-8 flex items-center justify-between">
          <div className="h-8 w-40 animate-pulse bg-medium-gray/10" />
          <div className="h-10 w-32 animate-pulse bg-medium-gray/10" />
        </div>
        <CardSkeletonGrid count={4} />
      </main>
    </div>
  );
}
