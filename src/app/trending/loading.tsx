import { AppHeader } from "@/components/app-header";

export default function TrendingLoading() {
  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Trending", href: "/trending" }} />
      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <div className="mb-2 h-8 w-48 animate-pulse bg-medium-gray/10" />
        <div className="mb-8 h-4 w-64 animate-pulse bg-medium-gray/10" />
        <div className="mb-8 flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-8 w-20 animate-pulse bg-medium-gray/10"
            />
          ))}
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-16 animate-pulse bg-medium-gray/10 border border-medium-gray/10"
            />
          ))}
        </div>
      </main>
    </div>
  );
}
