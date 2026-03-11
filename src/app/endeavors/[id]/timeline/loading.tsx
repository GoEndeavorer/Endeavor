import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

export default function TimelineLoading() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-2xl px-4 pt-24 pb-16">
        <div className="mb-6 flex items-center justify-between">
          <div className="h-7 w-32 bg-medium-gray/20 animate-pulse" />
          <div className="h-4 w-24 bg-medium-gray/10 animate-pulse" />
        </div>
        <div className="mb-6 flex gap-1.5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-7 w-20 bg-medium-gray/10 animate-pulse" />
          ))}
        </div>
        <div className="space-y-8">
          {[...Array(3)].map((_, g) => (
            <div key={g}>
              <div className="mb-3 h-3 w-36 bg-medium-gray/10 animate-pulse" />
              <div className="border-l border-medium-gray/20 pl-6 space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 w-3/4 bg-medium-gray/15 mb-1.5" />
                    <div className="h-3 w-1/3 bg-medium-gray/10" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
