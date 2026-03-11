import { AppHeader } from "@/components/app-header";

export default function CompareLoading() {
  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Compare", href: "/compare" }} />
      <main className="mx-auto max-w-5xl px-4 pt-24 pb-16">
        <div className="mb-2 h-8 w-40 animate-pulse bg-medium-gray/10" />
        <div className="mb-8 h-4 w-72 animate-pulse bg-medium-gray/10" />
        <div className="grid gap-6 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse border border-medium-gray/10 p-6 space-y-4"
            >
              <div className="h-6 w-32 bg-medium-gray/10" />
              <div className="h-40 w-full bg-medium-gray/10" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-medium-gray/10" />
                <div className="h-4 w-3/4 bg-medium-gray/10" />
                <div className="h-4 w-5/6 bg-medium-gray/10" />
              </div>
              <div className="h-10 w-full bg-medium-gray/10" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
