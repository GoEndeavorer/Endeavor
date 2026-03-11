"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/lib/use-debounce";

type Suggestion = {
  type: "endeavor" | "user" | "category";
  id: string;
  title: string;
  subtitle?: string;
};

export function SearchInput({ className = "" }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debouncedQuery = useDebounce(query, 200);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    fetch(`/api/search/suggestions?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setSuggestions(Array.isArray(data) ? data : []);
        setOpen(true);
        setSelectedIndex(-1);
      })
      .catch(() => {});
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigateTo = useCallback(
    (suggestion: Suggestion) => {
      setOpen(false);
      setQuery("");
      if (suggestion.type === "user") {
        router.push(`/users/${suggestion.id}`);
      } else if (suggestion.type === "category") {
        router.push(`/feed?category=${encodeURIComponent(suggestion.title)}`);
      } else {
        router.push(`/endeavors/${suggestion.id}`);
      }
    },
    [router]
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, suggestions.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, -1));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        navigateTo(suggestions[selectedIndex]);
      } else if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        setOpen(false);
      }
      return;
    }
  }

  const typeIcon: Record<string, string> = {
    endeavor: ">",
    user: "@",
    category: "#",
  };

  const typeColor: Record<string, string> = {
    endeavor: "text-code-green",
    user: "text-code-blue",
    category: "text-purple-400",
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search..."
        className="w-full border border-medium-gray/30 bg-transparent px-3 py-1.5 text-xs text-white outline-none placeholder:text-medium-gray focus:border-code-green/50"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 border border-medium-gray/30 bg-black shadow-lg">
          {suggestions.map((s, i) => (
            <button
              key={`${s.type}-${s.id}`}
              onClick={() => navigateTo(s)}
              onMouseEnter={() => setSelectedIndex(i)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors ${
                i === selectedIndex ? "bg-code-green/10" : "hover:bg-medium-gray/10"
              }`}
            >
              <span className={`font-mono font-bold ${typeColor[s.type] || "text-medium-gray"}`}>
                {typeIcon[s.type] || ">"}
              </span>
              <div className="min-w-0 flex-1">
                <p className={`truncate ${i === selectedIndex ? "text-code-green" : "text-light-gray"}`}>
                  {s.title}
                </p>
                {s.subtitle && (
                  <p className="truncate text-[10px] text-medium-gray">{s.subtitle}</p>
                )}
              </div>
              <span className="text-[10px] text-medium-gray">{s.type}</span>
            </button>
          ))}
          <button
            onClick={() => {
              router.push(`/search?q=${encodeURIComponent(query)}`);
              setOpen(false);
            }}
            className="flex w-full items-center gap-2 border-t border-medium-gray/20 px-3 py-2 text-left text-xs text-medium-gray hover:text-code-green transition-colors"
          >
            Search all for &ldquo;{query}&rdquo;
          </button>
        </div>
      )}
    </div>
  );
}
