import { AppHeader } from "@/components/app-header";

export default function Loading() {
  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Calendar", href: "/calendar" }} />
      <main className="mx-auto max-w-5xl px-4 pt-24 pb-16">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-8 w-48 animate-pulse bg-medium-gray/10" />
          <div className="flex gap-2">
            <div className="h-8 w-10 animate-pulse bg-medium-gray/10" />
            <div className="h-8 w-16 animate-pulse bg-medium-gray/10" />
            <div className="h-8 w-10 animate-pulse bg-medium-gray/10" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-px bg-medium-gray/10 border border-medium-gray/10">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse bg-medium-gray/5" />
          ))}
        </div>
      </main>
    </div>
  );
}
