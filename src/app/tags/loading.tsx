import { AppHeader } from "@/components/app-header";

export default function TagsLoading() {
  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Tags", href: "/tags" }} />
      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <div className="mb-2 h-8 w-28 animate-pulse bg-medium-gray/10" />
        <div className="mb-8 h-4 w-64 animate-pulse bg-medium-gray/10" />
        <div className="flex flex-wrap gap-3">
          {[20, 28, 16, 32, 24, 14, 36, 22, 18, 30, 26, 12, 34, 20, 28, 16, 24, 38, 14, 22].map(
            (w, i) => (
              <div
                key={i}
                className="animate-pulse bg-medium-gray/10 border border-medium-gray/10"
                style={{ width: `${w * 4}px`, height: i % 3 === 0 ? "40px" : i % 3 === 1 ? "32px" : "36px" }}
              />
            )
          )}
        </div>
      </main>
    </div>
  );
}
