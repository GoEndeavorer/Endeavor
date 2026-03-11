"use client";

import Link from "next/link";

export default function MaintenancePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
      {/* Terminal window */}
      <div className="w-full max-w-2xl border border-medium-gray/30">
        {/* Terminal title bar */}
        <div className="flex items-center gap-2 border-b border-medium-gray/30 px-4 py-2">
          <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <span className="ml-4 text-xs text-medium-gray/60">
            endeavor &mdash; maintenance
          </span>
        </div>

        {/* Terminal body */}
        <div className="p-8 md:p-12">
          {/* Status output */}
          <div className="mb-2 text-xs text-medium-gray/50">
            <span className="text-yellow-400">WARN</span> scheduled maintenance in progress
          </div>
          <div className="mb-4 font-mono text-xs text-medium-gray/40">
            {"// deploying updates to improve your experience"}
          </div>

          {/* Wrench icon via CSS */}
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center border border-yellow-400/30 bg-yellow-400/5">
              <span className="text-2xl text-yellow-400">&#9881;</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400 md:text-3xl">
                Under Maintenance
              </p>
              <p className="text-xs text-medium-gray/60">
                System status: upgrading
              </p>
            </div>
          </div>

          <p className="mb-6 text-sm leading-relaxed text-medium-gray">
            We&apos;re performing scheduled maintenance to improve performance and
            deploy new features. The platform will be back online shortly.
          </p>

          {/* Estimated return */}
          <div className="mb-6 border border-medium-gray/20 bg-medium-gray/5 p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-medium-gray/50">
              Estimated Return
            </p>
            <div className="flex flex-col gap-1">
              <p className="font-mono text-sm text-yellow-400">
                ~ 30 minutes
              </p>
              <p className="text-xs text-medium-gray/60">
                Typically back sooner than estimated
              </p>
            </div>
          </div>

          {/* Progress simulation */}
          <div className="mb-6 border-l-2 border-yellow-400/30 pl-4">
            <p className="mb-1 text-xs text-medium-gray/50">
              <span className="text-code-green">&#10003;</span> Database migrations
            </p>
            <p className="mb-1 text-xs text-medium-gray/50">
              <span className="text-code-green">&#10003;</span> Schema updates
            </p>
            <p className="mb-1 text-xs text-medium-gray/50">
              <span className="text-yellow-400">&#8226;</span> Deploying services...
            </p>
            <p className="text-xs text-medium-gray/40">
              <span className="text-medium-gray/30">&#9675;</span> Cache warm-up
            </p>
          </div>

          {/* Contact info */}
          <div className="mb-8 border border-medium-gray/20 bg-medium-gray/5 p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-medium-gray/50">
              Need to reach us?
            </p>
            <div className="flex flex-col gap-1">
              <p className="text-sm text-medium-gray">
                Email:{" "}
                <a
                  href="mailto:support@endeavor.app"
                  className="text-code-green hover:underline"
                >
                  support@endeavor.app
                </a>
              </p>
              <p className="text-sm text-medium-gray">
                Status page:{" "}
                <Link href="/status" className="text-code-green hover:underline">
                  endeavor.app/status
                </Link>
              </p>
            </div>
          </div>

          {/* Action */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => typeof window !== "undefined" && window.location.reload()}
              className="border border-code-green bg-code-green px-6 py-3 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-transparent hover:text-code-green"
            >
              Refresh Page
            </button>
            <Link
              href="/status"
              className="border border-medium-gray/50 px-6 py-3 text-xs font-bold uppercase tracking-wider text-medium-gray transition-colors hover:border-code-green hover:text-code-green"
            >
              System Status
            </Link>
          </div>
        </div>

        {/* Terminal prompt */}
        <div className="border-t border-medium-gray/30 px-4 py-3">
          <span className="text-xs text-medium-gray/40">
            <span className="text-yellow-400/60">$</span> waiting...
          </span>
        </div>
      </div>
    </div>
  );
}
