"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Endeavor Error Boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
      {/* Terminal window */}
      <div className="w-full max-w-2xl border border-medium-gray/30">
        {/* Terminal title bar */}
        <div className="flex items-center gap-2 border-b border-medium-gray/30 px-4 py-2">
          <span className="h-3 w-3 rounded-full bg-red-500/80" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <span className="h-3 w-3 rounded-full bg-green-500/80" />
          <span className="ml-4 text-xs text-medium-gray/60">
            endeavor &mdash; error
          </span>
        </div>

        {/* Terminal body */}
        <div className="p-8 md:p-12">
          {/* Error output */}
          <div className="mb-2 text-xs text-medium-gray/50">
            <span className="text-red-400">ERR!</span> uncaught exception
          </div>
          <div className="mb-1 font-mono text-xs text-medium-gray/40">
            {"// process exited with code 1"}
          </div>
          <p className="mb-1 text-4xl font-bold text-red-400 md:text-5xl">
            500
          </p>
          <p className="mb-1 text-lg font-semibold text-white/90">
            Something went wrong
          </p>
          <p className="mb-6 text-sm leading-relaxed text-medium-gray">
            An unexpected error occurred. Don&apos;t worry &mdash; your data is
            safe.
          </p>

          {/* Error details */}
          {error?.digest && (
            <div className="mb-6 border border-medium-gray/20 bg-medium-gray/5 p-4">
              <p className="mb-1 text-xs font-bold uppercase tracking-wider text-medium-gray/50">
                Error Reference
              </p>
              <code className="text-xs text-medium-gray/70">
                digest: {error.digest}
              </code>
            </div>
          )}

          {/* Stack trace style */}
          <div className="mb-8 border-l-2 border-red-400/30 pl-4">
            <p className="text-xs text-medium-gray/50">
              <span className="text-red-400/60">at</span> renderPage
            </p>
            <p className="text-xs text-medium-gray/50">
              <span className="text-red-400/60">at</span> processRequest
            </p>
            <p className="text-xs text-medium-gray/50">
              <span className="text-red-400/60">at</span>{" "}
              {error?.message
                ? error.message.length > 80
                  ? error.message.slice(0, 80) + "..."
                  : error.message
                : "Unknown error"}
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={reset}
              className="border border-code-green bg-code-green px-6 py-3 text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-transparent hover:text-code-green"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="border border-medium-gray/50 px-6 py-3 text-xs font-bold uppercase tracking-wider text-medium-gray transition-colors hover:border-code-green hover:text-code-green"
            >
              Go Home
            </Link>
            <Link
              href="/help"
              className="border border-medium-gray/50 px-6 py-3 text-xs font-bold uppercase tracking-wider text-medium-gray transition-colors hover:border-code-green hover:text-code-green"
            >
              Get Help
            </Link>
          </div>
        </div>

        {/* Terminal prompt */}
        <div className="border-t border-medium-gray/30 px-4 py-3">
          <span className="text-xs text-medium-gray/40">
            <span className="text-red-400/60">$</span> _
          </span>
        </div>
      </div>
    </div>
  );
}
