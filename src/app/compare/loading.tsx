import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

export default function CompareLoading() {
  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader breadcrumb={{ label: "Compare", href: "/compare" }} />
      <main className="mx-auto max-w-6xl px-4 pt-24 pb-16">
        {/* Title skeleton */}
        <div className="mb-2 h-8 w-56 animate-pulse bg-medium-gray/10" />
        <div className="mb-8 h-4 w-80 animate-pulse bg-medium-gray/10" />

        {/* Search bar skeleton */}
        <div className="mb-10 h-12 max-w-md animate-pulse bg-medium-gray/10" />

        {/* Two-column card skeleton */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse border border-medium-gray/10 p-5 space-y-3"
            >
              <div className="h-32 w-full bg-medium-gray/10" />
              <div className="h-5 w-40 bg-medium-gray/10" />
              <div className="h-3 w-60 bg-medium-gray/10" />
              <div className="h-4 w-full bg-medium-gray/10" />
            </div>
          ))}
        </div>

        {/* Comparison table skeleton */}
        <div className="mb-4 h-4 w-32 animate-pulse bg-medium-gray/10" />
        <div className="border border-medium-gray/10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex border-b border-medium-gray/10 last:border-b-0"
            >
              <div className="w-1/3 p-3">
                <div className="h-4 w-24 animate-pulse bg-medium-gray/10" />
              </div>
              <div className="w-1/3 p-3">
                <div className="h-4 w-20 animate-pulse bg-medium-gray/10" />
              </div>
              <div className="w-1/3 p-3">
                <div className="h-4 w-20 animate-pulse bg-medium-gray/10" />
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
