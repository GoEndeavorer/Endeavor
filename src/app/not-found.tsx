import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-black">
      <AppHeader />

      <main className="flex flex-1 flex-col items-center justify-center px-4 pt-16">
        {/* Terminal window */}
        <div className="w-full max-w-2xl border border-medium-gray/30">
          {/* Terminal title bar */}
          <div className="flex items-center gap-2 border-b border-medium-gray/30 px-4 py-2">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
            <span className="h-3 w-3 rounded-full bg-green-500/80" />
            <span className="ml-4 text-xs text-medium-gray/60">
              endeavor &mdash; not-found
            </span>
          </div>

          {/* Terminal body */}
          <div className="p-8 md:p-12">
            {/* Error code */}
            <div className="mb-2 text-xs text-medium-gray/50">
              <span className="text-code-green">$</span> GET /unknown-route
            </div>
            <div className="mb-1 font-mono text-xs text-medium-gray/40">
              {"// error: route not found"}
            </div>
            <p className="mb-1 text-6xl font-bold text-code-green md:text-7xl">
              404
            </p>
            <p className="mb-1 text-lg font-semibold text-white/90">
              Page not found
            </p>
            <p className="mb-8 text-sm leading-relaxed text-medium-gray">
              This page doesn&apos;t exist. Maybe it&apos;s an endeavor waiting to
              be created.
            </p>

            {/* Suggested routes */}
            <div className="mb-8 border-l-2 border-medium-gray/20 pl-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-medium-gray/50">
                Maybe you were looking for
              </p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/"
                  className="group flex items-center gap-2 text-sm text-medium-gray transition-colors hover:text-code-green"
                >
                  <span className="text-code-green/50 transition-colors group-hover:text-code-green">
                    ~/
                  </span>
                  Home
                </Link>
                <Link
                  href="/feed"
                  className="group flex items-center gap-2 text-sm text-medium-gray transition-colors hover:text-code-green"
                >
                  <span className="text-code-green/50 transition-colors group-hover:text-code-green">
                    ~/feed
                  </span>
                  Feed
                </Link>
                <Link
                  href="/discover"
                  className="group flex items-center gap-2 text-sm text-medium-gray transition-colors hover:text-code-green"
                >
                  <span className="text-code-green/50 transition-colors group-hover:text-code-green">
                    ~/discover
                  </span>
                  Discover
                </Link>
                <Link
                  href="/search"
                  className="group flex items-center gap-2 text-sm text-medium-gray transition-colors hover:text-code-green"
                >
                  <span className="text-code-green/50 transition-colors group-hover:text-code-green">
                    ~/search
                  </span>
                  Search
                </Link>
                <Link
                  href="/explore"
                  className="group flex items-center gap-2 text-sm text-medium-gray transition-colors hover:text-code-green"
                >
                  <span className="text-code-green/50 transition-colors group-hover:text-code-green">
                    ~/explore
                  </span>
                  Explore
                </Link>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="border border-code-green bg-code-green px-6 py-3 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-transparent hover:text-code-green"
              >
                Go Home
              </Link>
              <Link
                href="/feed"
                className="border border-medium-gray/50 px-6 py-3 text-xs font-bold uppercase tracking-wider text-medium-gray transition-colors hover:border-code-green hover:text-code-green"
              >
                Browse Feed
              </Link>
            </div>
          </div>

          {/* Terminal prompt */}
          <div className="border-t border-medium-gray/30 px-4 py-3">
            <span className="text-xs text-medium-gray/40">
              <span className="text-code-green/60">$</span> _
            </span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
