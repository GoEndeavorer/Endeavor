"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <p className="mb-2 text-4xl font-bold text-red-400">Error</p>
      <p className="mb-6 text-sm text-medium-gray">
        Something went wrong. Please try again.
      </p>
      <button
        onClick={reset}
        className="border border-code-green px-6 py-3 text-xs font-bold uppercase text-code-green transition-colors hover:bg-code-green hover:text-black"
      >
        Try Again
      </button>
    </div>
  );
}
