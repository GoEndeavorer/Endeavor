import { AppHeader } from "@/components/app-header";

export default function ContactLoading() {
  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Contact", href: "/contact" }} />
      <main className="mx-auto max-w-xl px-4 pt-24 pb-16">
        <div className="mb-2 h-8 w-36 animate-pulse bg-medium-gray/10" />
        <div className="mb-8 h-4 w-64 animate-pulse bg-medium-gray/10" />
        <div className="animate-pulse space-y-5 border border-medium-gray/10 p-6">
          <div className="space-y-2">
            <div className="h-4 w-16 bg-medium-gray/10" />
            <div className="h-12 w-full bg-medium-gray/10" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-14 bg-medium-gray/10" />
            <div className="h-12 w-full bg-medium-gray/10" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-20 bg-medium-gray/10" />
            <div className="h-12 w-full bg-medium-gray/10" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-24 bg-medium-gray/10" />
            <div className="h-32 w-full bg-medium-gray/10" />
          </div>
          <div className="h-12 w-full bg-medium-gray/10" />
        </div>
      </main>
    </div>
  );
}
