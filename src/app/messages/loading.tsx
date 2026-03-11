import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

export default function MessagesLoading() {
  return (
    <>
      <AppHeader />
      <main id="main-content" className="mx-auto max-w-6xl px-4 pt-24 pb-16">
        <div className="flex h-[calc(100vh-200px)] min-h-[500px] border border-medium-gray/20">
          <div className="w-80 shrink-0 border-r border-medium-gray/20">
            <div className="border-b border-medium-gray/20 p-4">
              <div className="h-4 w-24 animate-pulse bg-medium-gray/10" />
            </div>
            <div className="space-y-0">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse border-b border-medium-gray/10 p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 bg-medium-gray/10" />
                    <div className="flex-1">
                      <div className="mb-1 h-3 w-24 bg-medium-gray/10" />
                      <div className="h-2.5 w-40 bg-medium-gray/10" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="h-4 w-40 animate-pulse bg-medium-gray/10" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
