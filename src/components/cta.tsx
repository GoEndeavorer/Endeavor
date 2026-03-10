import Link from "next/link";

export function CTA() {
  return (
    <section className="border-t border-medium-gray/30 py-20">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="mb-4 text-3xl font-bold md:text-4xl">
          Ready to start?
        </h2>
        <p className="mb-8 text-lg text-light-gray">
          Post your first endeavor or join one that&apos;s already happening.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="w-full border border-code-green bg-code-green px-8 py-3 text-sm font-bold uppercase text-black transition-colors hover:bg-transparent hover:text-code-green sm:w-auto"
          >
            Start an Endeavor
          </Link>
          <a
            href="#explore"
            className="w-full border border-medium-gray px-8 py-3 text-sm font-bold uppercase transition-colors hover:border-code-blue hover:text-code-blue sm:w-auto"
          >
            Browse Endeavors
          </a>
        </div>
      </div>
    </section>
  );
}
