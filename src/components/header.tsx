"use client";

import { useState } from "react";
import Link from "next/link";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-medium-gray/30 bg-black/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Endeavor
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <a href="#how-it-works" className="text-sm text-code-blue hover:text-code-green transition-colors">
            How It Works
          </a>
          <a href="#explore" className="text-sm text-code-blue hover:text-code-green transition-colors">
            Explore
          </a>
          <a href="#about" className="text-sm text-code-blue hover:text-code-green transition-colors">
            About
          </a>
          <Link
            href="/signup"
            className="border border-medium-gray bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-code-green hover:border-code-green"
          >
            Get Started
          </Link>
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
        <nav className="flex flex-col gap-4 border-t border-medium-gray/30 bg-black px-4 py-6 md:hidden">
          <a href="#how-it-works" className="text-sm text-code-blue" onClick={() => setMenuOpen(false)}>
            How It Works
          </a>
          <a href="#explore" className="text-sm text-code-blue" onClick={() => setMenuOpen(false)}>
            Explore
          </a>
          <a href="#about" className="text-sm text-code-blue" onClick={() => setMenuOpen(false)}>
            About
          </a>
          <Link
            href="/signup"
            className="border border-medium-gray bg-white px-4 py-2 text-center text-sm font-semibold text-black"
            onClick={() => setMenuOpen(false)}
          >
            Get Started
          </Link>
        </nav>
      )}
    </header>
  );
}
