import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <p className="mb-2 text-6xl font-bold text-code-green">404</p>
      <p className="mb-6 text-sm text-medium-gray">
        This page doesn&apos;t exist. Maybe it&apos;s an endeavor waiting to be created.
      </p>
      <div className="flex gap-4">
        <Link
          href="/"
          className="border border-medium-gray/50 px-6 py-3 text-xs font-bold uppercase text-medium-gray transition-colors hover:border-code-green hover:text-code-green"
        >
          Home
        </Link>
        <Link
          href="/feed"
          className="border border-code-green bg-code-green px-6 py-3 text-xs font-bold uppercase text-black transition-colors hover:bg-transparent hover:text-code-green"
        >
          Explore
        </Link>
      </div>
    </div>
  );
}
