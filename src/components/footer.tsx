import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-medium-gray/30 py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 grid gap-8 sm:grid-cols-3">
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// platform"}
            </h4>
            <nav className="flex flex-col gap-2">
              <Link href="/feed" className="text-sm text-medium-gray hover:text-code-green">
                Explore Endeavors
              </Link>
              <Link href="/explore" className="text-sm text-medium-gray hover:text-code-green">
                Trending
              </Link>
              <Link href="/endeavors/completed" className="text-sm text-medium-gray hover:text-code-green">
                Completed
              </Link>
              <Link href="/stories" className="text-sm text-medium-gray hover:text-code-green">
                Stories
              </Link>
              <Link href="/endeavors/create" className="text-sm text-medium-gray hover:text-code-green">
                Start an Endeavor
              </Link>
              <Link href="/templates" className="text-sm text-medium-gray hover:text-code-green">
                Templates
              </Link>
              <Link href="/categories" className="text-sm text-medium-gray hover:text-code-green">
                Browse Categories
              </Link>
              <Link href="/hiring" className="text-sm text-medium-gray hover:text-code-green">
                Who&apos;s Hiring
              </Link>
              <Link href="/leaderboard" className="text-sm text-medium-gray hover:text-code-green">
                Leaderboard
              </Link>
              <Link href="/people" className="text-sm text-medium-gray hover:text-code-green">
                People
              </Link>
              <Link href="/discover" className="text-sm text-medium-gray hover:text-code-green">
                Discover
              </Link>
              <Link href="/tags" className="text-sm text-medium-gray hover:text-code-green">
                Tags
              </Link>
              <Link href="/needs" className="text-sm text-medium-gray hover:text-code-green">
                Browse by Need
              </Link>
              <Link href="/map" className="text-sm text-medium-gray hover:text-code-green">
                Map
              </Link>
              <Link href="/calendar" className="text-sm text-medium-gray hover:text-code-green">
                Calendar
              </Link>
              <Link href="/search" className="text-sm text-medium-gray hover:text-code-green">
                Search
              </Link>
              <Link href="/activity" className="text-sm text-medium-gray hover:text-code-green">
                Platform Activity
              </Link>
              <Link href="/stats" className="text-sm text-medium-gray hover:text-code-green">
                Platform Stats
              </Link>
            </nav>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// account"}
            </h4>
            <nav className="flex flex-col gap-2">
              <Link href="/signup" className="text-sm text-medium-gray hover:text-code-green">
                Sign Up
              </Link>
              <Link href="/login" className="text-sm text-medium-gray hover:text-code-green">
                Log In
              </Link>
              <Link href="/dashboard" className="text-sm text-medium-gray hover:text-code-green">
                Dashboard
              </Link>
              <Link href="/profile" className="text-sm text-medium-gray hover:text-code-green">
                Profile
              </Link>
              <Link href="/my-endeavors" className="text-sm text-medium-gray hover:text-code-green">
                My Endeavors
              </Link>
              <Link href="/saved" className="text-sm text-medium-gray hover:text-code-green">
                Saved
              </Link>
              <Link href="/messages" className="text-sm text-medium-gray hover:text-code-green">
                Messages
              </Link>
              <Link href="/settings" className="text-sm text-medium-gray hover:text-code-green">
                Settings
              </Link>
            </nav>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// about"}
            </h4>
            <p className="mb-4 text-sm leading-relaxed text-medium-gray">
              Post what you want to do. Find people who want to do it with you. Plan it, fund it, make it happen.
            </p>
            <nav className="flex flex-col gap-2">
              <Link href="/about" className="text-sm text-medium-gray hover:text-code-green">
                About &amp; FAQ
              </Link>
              <Link href="/guides" className="text-sm text-medium-gray hover:text-code-green">
                Guides
              </Link>
              <Link href="/changelog" className="text-sm text-medium-gray hover:text-code-green">
                Changelog
              </Link>
              <Link href="/privacy" className="text-sm text-medium-gray hover:text-code-green">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-medium-gray hover:text-code-green">
                Terms of Service
              </Link>
              <Link href="/help" className="text-sm text-medium-gray hover:text-code-green">
                Help Center
              </Link>
              <Link href="/compare" className="text-sm text-medium-gray hover:text-code-green">
                Compare Endeavors
              </Link>
              <Link href="/contact" className="text-sm text-medium-gray hover:text-code-green">
                Contact
              </Link>
              <Link href="/status" className="text-sm text-medium-gray hover:text-code-green">
                System Status
              </Link>
            </nav>
          </div>
        </div>
        <div className="border-t border-medium-gray/20 pt-6 text-center">
          <p className="text-xs text-medium-gray">
            &copy; {new Date().getFullYear()} Endeavor. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
