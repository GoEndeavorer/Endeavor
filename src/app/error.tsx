"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <p className="mb-2 text-4xl font-bold text-red-400">Something went wrong</p>
      <p className="mb-6 text-sm text-medium-gray">
        An unexpected error occurred. Please try again.
      </p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="border border-code-green px-6 py-3 text-xs font-bold uppercase text-code-green transition-colors hover:bg-code-green hover:text-black"
        >
          Try Again
        </button>
        <Link
          href="/"
          className="border border-medium-gray/50 px-6 py-3 text-xs font-bold uppercase text-medium-gray transition-colors hover:border-code-green hover:text-code-green"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
