import Link from "next/link";

export function Hero() {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="max-w-3xl">
        <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-code-green">
          {"// launch your next endeavor"}
        </p>
        <h1 className="mb-6 text-4xl font-bold leading-tight md:text-6xl">
          Post. Join. Plan.{" "}
          <span className="text-code-green">Make it happen.</span>
        </h1>
        <p className="mx-auto mb-10 max-w-xl text-lg text-light-gray">
          Post what you want to do. Find people who want to do it with you.
          Plan it together, fund it if you need to, and make it real.
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
            className="w-full border border-medium-gray px-8 py-3 text-sm font-bold uppercase text-white transition-colors hover:border-code-blue hover:text-code-blue sm:w-auto"
          >
            Explore Endeavors
          </a>
        </div>
      </div>
    </section>
  );
}
