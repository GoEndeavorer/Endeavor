import { AppHeader } from "@/components/app-header";

export default function StatusLoading() {
  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Status", href: "/status" }} />
      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <div className="mb-2 h-8 w-48 animate-pulse bg-medium-gray/10" />
        <div className="mb-8 h-4 w-64 animate-pulse bg-medium-gray/10" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between animate-pulse border border-medium-gray/10 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-medium-gray/10" />
                <div className="h-4 w-36 bg-medium-gray/10" />
              </div>
              <div className="h-4 w-24 bg-medium-gray/10" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
