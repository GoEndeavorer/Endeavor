import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

export default function StatsLoading() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <div className="mb-8 h-7 w-48 bg-medium-gray/20 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border border-medium-gray/20 p-6 animate-pulse">
              <div className="h-8 w-16 bg-medium-gray/20 mb-2" />
              <div className="h-3 w-24 bg-medium-gray/10" />
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
