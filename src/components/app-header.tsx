"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { NotificationBell } from "@/components/notification-bell";

export function AppHeader({ breadcrumb }: { breadcrumb?: { label: string; href: string } }) {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-medium-gray/30 bg-black/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="text-xl font-bold flex-shrink-0">
            Endeavor
          </Link>
          {breadcrumb && (
            <>
              <span className="text-medium-gray">/</span>
              <Link
                href={breadcrumb.href}
                className="truncate text-sm text-code-blue hover:text-code-green"
              >
                {breadcrumb.label}
              </Link>
            </>
          )}
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-4 md:flex">
          <Link href="/feed" className="text-sm text-code-blue hover:text-code-green">
            Explore
          </Link>
          {session ? (
            <>
              <Link
                href="/endeavors/create"
                className="border border-code-green bg-code-green px-4 py-2 text-xs font-bold uppercase text-black transition-colors hover:bg-transparent hover:text-code-green"
              >
                + New
              </Link>
              <Link href="/my-endeavors" className="text-sm text-medium-gray hover:text-code-green">
                My Endeavors
              </Link>
              <NotificationBell />
              <Link href="/profile" className="text-sm text-code-blue hover:text-code-green">
                Profile
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-code-blue hover:text-code-green">
                Log In
              </Link>
              <Link
                href="/signup"
                className="border border-medium-gray bg-white px-4 py-2 text-xs font-semibold text-black"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          className="flex flex-col gap-1.5 md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block h-0.5 w-6 bg-white transition-transform ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block h-0.5 w-6 bg-white transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-6 bg-white transition-transform ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <nav className="flex flex-col gap-3 border-t border-medium-gray/30 bg-black px-4 py-4 md:hidden">
          <Link href="/feed" className="text-sm text-code-blue" onClick={() => setMenuOpen(false)}>
            Explore
          </Link>
          <Link href="/categories" className="text-sm text-code-blue" onClick={() => setMenuOpen(false)}>
            Categories
          </Link>
          {session ? (
            <>
              <Link href="/endeavors/create" className="text-sm text-code-green" onClick={() => setMenuOpen(false)}>
                + New Endeavor
              </Link>
              <Link href="/my-endeavors" className="text-sm text-code-blue" onClick={() => setMenuOpen(false)}>
                My Endeavors
              </Link>
              <Link href="/notifications" className="text-sm text-code-blue" onClick={() => setMenuOpen(false)}>
                Notifications
              </Link>
              <Link href="/profile" className="text-sm text-code-blue" onClick={() => setMenuOpen(false)}>
                Profile
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-code-blue" onClick={() => setMenuOpen(false)}>
                Log In
              </Link>
              <Link href="/signup" className="text-sm text-code-blue" onClick={() => setMenuOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
