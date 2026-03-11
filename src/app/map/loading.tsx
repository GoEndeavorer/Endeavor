import { AppHeader } from "@/components/app-header";

export default function Loading() {
  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Map", href: "/map" }} />
      <main className="mx-auto max-w-6xl px-4 pt-24 pb-16">
        <div className="mb-6">
          <div className="h-8 w-48 animate-pulse bg-medium-gray/10 mb-2" />
          <div className="h-4 w-64 animate-pulse bg-medium-gray/10" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse bg-medium-gray/10 border border-medium-gray/10" />
          ))}
        </div>
      </main>
    </div>
  );
}
