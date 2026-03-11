"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

type Tag = {
  tag: string;
  count: number;
};

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/tags")
      .then((r) => r.ok ? r.json() : [])
      .then(setTags)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? tags.filter((t) => t.tag.toLowerCase().includes(search.toLowerCase()))
    : tags;

  const maxCount = Math.max(...tags.map((t) => t.count), 1);

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Tags", href: "/tags" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <h1 className="mb-2 text-3xl font-bold">Tags</h1>
        <p className="mb-6 text-sm text-medium-gray">
          Skills and needs across all endeavors. Click a tag to find matching opportunities.
        </p>

        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter tags..."
          className="mb-8 w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
        />

        {loading ? (
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="h-8 w-24 animate-pulse bg-medium-gray/10" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-medium-gray">No tags found.</p>
        ) : (
          <>
            {/* Tag cloud */}
            <div className="mb-12 flex flex-wrap gap-2">
              {filtered.map((t) => {
                const size = Math.max(12, Math.min(24, 12 + (t.count / maxCount) * 12));
                const opacity = 0.4 + (t.count / maxCount) * 0.6;
                return (
                  <Link
                    key={t.tag}
                    href={`/hiring?skill=${encodeURIComponent(t.tag)}`}
                    className="border border-code-green/30 px-3 py-1.5 text-code-green transition-colors hover:bg-code-green hover:text-black"
                    style={{ fontSize: `${size}px`, opacity }}
                  >
                    {t.tag}
                    <span className="ml-1 text-[10px] opacity-60">({t.count})</span>
                  </Link>
                );
              })}
            </div>

            {/* Tag list */}
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// all tags"}
            </h2>
            <div className="space-y-1">
              {filtered.map((t) => (
                <Link
                  key={t.tag}
                  href={`/hiring?skill=${encodeURIComponent(t.tag)}`}
                  className="flex items-center justify-between border border-medium-gray/10 px-4 py-2 transition-colors hover:border-code-green/30 group"
                >
                  <span className="text-sm group-hover:text-code-green transition-colors">
                    {t.tag}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-24 bg-medium-gray/10">
                      <div
                        className="h-1.5 bg-code-green/50"
                        style={{ width: `${(t.count / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-medium-gray w-8 text-right">
                      {t.count}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
