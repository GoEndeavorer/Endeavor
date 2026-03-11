import { AppHeader } from "@/components/app-header";

export default function StatsLoading() {
  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Stats", href: "/stats" }} />
      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <div className="mb-8">
          <div className="h-8 w-48 animate-pulse bg-medium-gray/10 mb-2" />
          <div className="h-4 w-64 animate-pulse bg-medium-gray/10" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse bg-medium-gray/10 border border-medium-gray/10" />
          ))}
        </div>
      </main>
    </div>
  );
}
