import { AppHeader } from "@/components/app-header";

export default function DiscoverLoading() {
  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Discover", href: "/discover" }} />
      <main className="mx-auto max-w-6xl px-4 pt-24 pb-16">
        <div className="mb-2 h-8 w-40 animate-pulse bg-medium-gray/10" />
        <div className="mb-8 h-4 w-72 animate-pulse bg-medium-gray/10" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-48 animate-pulse bg-medium-gray/10 border border-medium-gray/10"
            />
          ))}
        </div>
      </main>
    </div>
  );
}
