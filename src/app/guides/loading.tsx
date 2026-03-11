import { AppHeader } from "@/components/app-header";

export default function GuidesLoading() {
  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Guides", href: "/guides" }} />
      <main className="mx-auto max-w-6xl px-4 pt-24 pb-16">
        <div className="mb-2 h-8 w-32 animate-pulse bg-medium-gray/10" />
        <div className="mb-8 h-4 w-64 animate-pulse bg-medium-gray/10" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse border border-medium-gray/10 p-5"
            >
              <div className="mb-3 h-5 w-3/4 bg-medium-gray/10" />
              <div className="mb-2 h-3 w-full bg-medium-gray/10" />
              <div className="mb-4 h-3 w-5/6 bg-medium-gray/10" />
              <div className="h-8 w-24 bg-medium-gray/10" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
