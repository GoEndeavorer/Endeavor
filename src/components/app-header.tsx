"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { NotificationBell } from "@/components/notification-bell";

type SearchResult = {
  endeavors: { id: string; title: string; category: string; status: string; imageUrl: string | null }[];
  users: { id: string; name: string; bio: string | null; image: string | null }[];
};

export function AppHeader({ breadcrumb }: { breadcrumb?: { label: string; href: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Keyboard shortcut: Cmd+K or Ctrl+K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setQuery("");
        setResults(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Focus input when search opens
  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setQuery("");
        setResults(null);
      }
    }
    if (searchOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [searchOpen]);

  // Search on query change
  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      return;
    }
    const timeout = setTimeout(async () => {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) setResults(await res.json());
    }, 200);
    return () => clearTimeout(timeout);
  }, [query]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [results]);

  function navigateTo(href: string) {
    setSearchOpen(false);
    setQuery("");
    setResults(null);
    setSelectedIndex(-1);
    router.push(href);
  }

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (!results) return;
    const allItems = [
      ...results.endeavors.map((e) => `/endeavors/${e.id}`),
      ...results.users.map((u) => `/users/${u.id}`),
    ];
    if (allItems.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, allItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < allItems.length) {
        navigateTo(allItems[selectedIndex]);
      } else if (query.length >= 2) {
        navigateTo(`/search?q=${encodeURIComponent(query)}`);
      }
    }
  }

  return (
    <>
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
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center gap-2 border border-medium-gray/30 px-3 py-1.5 text-xs text-medium-gray transition-colors hover:border-code-green hover:text-code-green"
            >
              Search
              <kbd className="border border-medium-gray/30 px-1 text-[10px]">⌘K</kbd>
            </button>
            <Link href="/feed" className="text-sm text-code-blue hover:text-code-green">
              Explore
            </Link>
            <Link href="/hiring" className="text-sm text-medium-gray hover:text-code-green">
              Hiring
            </Link>
            <Link href="/people" className="text-sm text-medium-gray hover:text-code-green">
              People
            </Link>
            <Link href="/leaderboard" className="text-sm text-medium-gray hover:text-code-green">
              Ranks
            </Link>
            <Link href="/map" className="text-sm text-medium-gray hover:text-code-green">
              Map
            </Link>
            {session && (
              <>
                <Link href="/following" className="text-sm text-medium-gray hover:text-code-green">
                  Following
                </Link>
                <Link href="/calendar" className="text-sm text-medium-gray hover:text-code-green">
                  Calendar
                </Link>
              </>
            )}
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
                <Link href="/saved" className="text-sm text-medium-gray hover:text-code-green">
                  Saved
                </Link>
                <Link href="/collections" className="text-sm text-medium-gray hover:text-code-green">
                  Lists
                </Link>
                <Link href="/digest" className="text-sm text-medium-gray hover:text-code-green">
                  Digest
                </Link>
                <Link href="/messages" className="text-sm text-medium-gray hover:text-code-green">
                  DMs
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
            <Link href="/activity" className="text-sm text-code-blue" onClick={() => setMenuOpen(false)}>
              Activity
            </Link>
            <Link href="/hiring" className="text-sm text-code-blue" onClick={() => setMenuOpen(false)}>
              Who&apos;s Hiring
            </Link>
            <Link href="/people" className="text-sm text-code-blue" onClick={() => setMenuOpen(false)}>
              People
            </Link>
            <Link href="/leaderboard" className="text-sm text-code-blue" onClick={() => setMenuOpen(false)}>
              Leaderboard
            </Link>
            <Link href="/stories" className="text-sm text-code-blue" onClick={() => setMenuOpen(false)}>
              Stories
            </Link>
            <Link href="/map" className="text-sm text-code-blue" onClick={() => setMenuOpen(false)}>
              Map
            </Link>
            {session ? (
              <>
                <Link href="/following" className="text-sm text-code-blue" onClick={() => setMenuOpen(false)}>
                  Following
                </Link>
                <Link href="/endeavors/create" className="text-sm text-code-green" onClick={() => setMenuOpen(false)}>
                  + New Endeavor
                </Link>
                <Link href="/my-endeavors" className="text-sm text-code-blue" onClick={() => setMenuOpen(false)}>
                  My Endeavors
                </Link>
                <Link href="/saved" className="text-sm text-code-blue" onClick={() => setMenuOpen(false)}>
                  Saved
                </Link>
                <Link href="/collections" className="text-sm text-code-blue" onClick={() => setMenuOpen(false)}>
                  Collections
                </Link>
                <Link href="/dashboard" className="text-sm text-code-blue" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link href="/calendar" className="text-sm text-code-blue" onClick={() => setMenuOpen(false)}>
                  Calendar
                </Link>
                <Link href="/messages" className="text-sm text-code-blue" onClick={() => setMenuOpen(false)}>
                  Messages
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

      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/80 pt-20 px-4">
          <div ref={searchRef} className="w-full max-w-lg border border-medium-gray/30 bg-black">
            <div className="flex items-center border-b border-medium-gray/20 px-4">
              <span className="text-sm text-medium-gray mr-2">&gt;</span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search endeavors, people, skills..."
                className="flex-1 bg-transparent py-4 text-sm text-white outline-none"
              />
              <button
                onClick={() => { setSearchOpen(false); setQuery(""); setResults(null); }}
                className="text-xs text-medium-gray hover:text-white"
              >
                ESC
              </button>
            </div>

            {results && (
              <div className="max-h-80 overflow-y-auto">
                {results.endeavors.length > 0 && (
                  <div className="px-4 py-2">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-code-green">
                      Endeavors
                    </p>
                    {results.endeavors.map((e, idx) => (
                      <button
                        key={e.id}
                        onClick={() => navigateTo(`/endeavors/${e.id}`)}
                        className={`flex w-full items-center gap-3 px-2 py-2 text-left transition-colors ${
                          selectedIndex === idx ? "bg-code-green/20" : "hover:bg-code-green/10"
                        }`}
                      >
                        {e.imageUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={e.imageUrl} alt="" className="h-8 w-10 object-cover shrink-0" />
                        ) : (
                          <div className="flex h-8 w-10 items-center justify-center bg-code-green/10 shrink-0 text-xs text-code-green">
                            {e.title.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{e.title}</p>
                          <p className="text-xs text-medium-gray">{e.category} &middot; {e.status}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {results.users.length > 0 && (
                  <div className="px-4 py-2 border-t border-medium-gray/10">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-code-blue">
                      People
                    </p>
                    {results.users.map((u, idx) => (
                      <button
                        key={u.id}
                        onClick={() => navigateTo(`/users/${u.id}`)}
                        className={`flex w-full items-center gap-3 px-2 py-2 text-left transition-colors ${
                          selectedIndex === results.endeavors.length + idx ? "bg-code-blue/20" : "hover:bg-code-blue/10"
                        }`}
                      >
                        <div className="flex h-8 w-8 items-center justify-center bg-code-blue/10 shrink-0 text-xs text-code-blue font-bold">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{u.name}</p>
                          {u.bio && <p className="text-xs text-medium-gray truncate">{u.bio}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {results.endeavors.length === 0 && results.users.length === 0 && query.length >= 2 && (
                  <div className="px-4 py-6 text-center text-sm text-medium-gray">
                    No results for &quot;{query}&quot;
                  </div>
                )}

                {(results.endeavors.length > 0 || results.users.length > 0) && (
                  <div className="border-t border-medium-gray/10 px-4 py-3">
                    <button
                      onClick={() => navigateTo(`/search?q=${encodeURIComponent(query)}`)}
                      className="w-full text-center text-xs text-medium-gray hover:text-code-green transition-colors"
                    >
                      View all results &rarr;
                    </button>
                  </div>
                )}
              </div>
            )}

            {!results && query.length < 2 && (
              <div className="px-4 py-6 text-center text-xs text-medium-gray">
                Type at least 2 characters to search
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
