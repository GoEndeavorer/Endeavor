"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

type SearchResults = {
  endeavors: {
    id: string;
    title: string;
    category: string;
    status: string;
    imageUrl: string | null;
  }[];
  users: {
    id: string;
    name: string;
    bio: string | null;
    image: string | null;
  }[];
  stories: {
    id: string;
    title: string;
    endeavorId: string;
    authorName: string;
    createdAt: string;
  }[];
  discussions: {
    id: string;
    content: string;
    endeavorId: string;
    authorName: string;
    createdAt: string;
  }[];
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"all" | "endeavors" | "people" | "stories" | "discussions">("all");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("relevant");

  useEffect(() => {
    if (initialQuery.length >= 2) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  async function performSearch(q: string) {
    if (q.length < 2) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ q });
      if (category) params.set("category", category);
      if (status) params.set("status", status);
      if (sort !== "relevant") params.set("sort", sort);
      const res = await fetch(`/api/search?${params.toString()}`);
      if (res.ok) setResults(await res.json());
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    performSearch(query);
    window.history.replaceState(null, "", `/search?q=${encodeURIComponent(query)}`);
  }

  const endeavorCount = results?.endeavors.length || 0;
  const userCount = results?.users.length || 0;
  const storyCount = results?.stories?.length || 0;
  const discussionCount = results?.discussions?.length || 0;
  const totalCount = endeavorCount + userCount + storyCount + discussionCount;

  return (
    <>
      <AppHeader />
      <main id="main-content" className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <h1 className="mb-6 text-2xl font-bold">Search</h1>

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-medium-gray">&gt;</span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search endeavors, people, skills, locations..."
                className="w-full border border-medium-gray/50 bg-transparent py-3 pl-8 pr-4 text-sm text-white outline-none focus:border-code-green"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="border border-code-green bg-code-green px-6 py-3 text-sm font-bold uppercase text-black transition-colors hover:bg-transparent hover:text-code-green"
            >
              Search
            </button>
          </div>
        </form>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); if (query.length >= 2) performSearch(query); }}
            className="border border-medium-gray/30 bg-black px-3 py-1.5 text-xs text-white focus:border-code-green focus:outline-none"
          >
            <option value="">All Categories</option>
            {["Adventure", "Scientific", "Creative", "Tech", "Cultural", "Community"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); if (query.length >= 2) performSearch(query); }}
            className="border border-medium-gray/30 bg-black px-3 py-1.5 text-xs text-white focus:border-code-green focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); if (query.length >= 2) performSearch(query); }}
            className="border border-medium-gray/30 bg-black px-3 py-1.5 text-xs text-white focus:border-code-green focus:outline-none"
          >
            <option value="relevant">Most Relevant</option>
            <option value="newest">Newest</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>

        {loading && (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse border border-medium-gray/20 p-4">
                <div className="mb-2 h-4 w-48 bg-medium-gray/10" />
                <div className="h-3 w-32 bg-medium-gray/10" />
              </div>
            ))}
          </div>
        )}

        {results && !loading && (
          <>
            <div className="mb-6 flex gap-4 border-b border-medium-gray/20">
              <button
                onClick={() => setTab("all")}
                className={`pb-3 text-sm font-semibold transition-colors ${tab === "all" ? "border-b-2 border-code-green text-code-green" : "text-medium-gray hover:text-white"}`}
              >
                All ({totalCount})
              </button>
              <button
                onClick={() => setTab("endeavors")}
                className={`pb-3 text-sm font-semibold transition-colors ${tab === "endeavors" ? "border-b-2 border-code-green text-code-green" : "text-medium-gray hover:text-white"}`}
              >
                Endeavors ({endeavorCount})
              </button>
              <button
                onClick={() => setTab("people")}
                className={`pb-3 text-sm font-semibold transition-colors ${tab === "people" ? "border-b-2 border-code-blue text-code-blue" : "text-medium-gray hover:text-white"}`}
              >
                People ({userCount})
              </button>
              {storyCount > 0 && (
                <button
                  onClick={() => setTab("stories")}
                  className={`pb-3 text-sm font-semibold transition-colors ${tab === "stories" ? "border-b-2 border-purple-400 text-purple-400" : "text-medium-gray hover:text-white"}`}
                >
                  Stories ({storyCount})
                </button>
              )}
              {discussionCount > 0 && (
                <button
                  onClick={() => setTab("discussions")}
                  className={`pb-3 text-sm font-semibold transition-colors ${tab === "discussions" ? "border-b-2 border-yellow-400 text-yellow-400" : "text-medium-gray hover:text-white"}`}
                >
                  Discussions ({discussionCount})
                </button>
              )}
            </div>

            {(tab === "all" || tab === "endeavors") && endeavorCount > 0 && (
              <div className="mb-8">
                {tab === "all" && (
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
                    Endeavors
                  </h2>
                )}
                <div className="space-y-3">
                  {results.endeavors.map((e) => (
                    <Link
                      key={e.id}
                      href={`/endeavors/${e.id}`}
                      className="flex items-center gap-4 border border-medium-gray/20 p-4 transition-colors hover:border-code-green/50"
                    >
                      {e.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={e.imageUrl} alt="" className="h-12 w-16 object-cover shrink-0" />
                      ) : (
                        <div className="flex h-12 w-16 items-center justify-center bg-code-green/10 shrink-0 text-lg font-bold text-code-green">
                          {e.title.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{e.title}</p>
                        <p className="text-xs text-medium-gray">
                          {e.category} &middot;{" "}
                          <span className={e.status === "open" ? "text-code-green" : e.status === "in-progress" ? "text-code-blue" : "text-medium-gray"}>
                            {e.status}
                          </span>
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {(tab === "all" || tab === "people") && userCount > 0 && (
              <div className="mb-8">
                {tab === "all" && (
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-blue">
                    People
                  </h2>
                )}
                <div className="space-y-3">
                  {results.users.map((u) => (
                    <Link
                      key={u.id}
                      href={`/users/${u.id}`}
                      className="flex items-center gap-4 border border-medium-gray/20 p-4 transition-colors hover:border-code-blue/50"
                    >
                      <div className="flex h-10 w-10 items-center justify-center bg-code-blue/10 shrink-0 text-sm font-bold text-code-blue">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{u.name}</p>
                        {u.bio && (
                          <p className="text-xs text-medium-gray truncate">{u.bio}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {(tab === "all" || tab === "stories") && storyCount > 0 && (
              <div className="mb-8">
                {tab === "all" && (
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-purple-400">
                    Stories
                  </h2>
                )}
                <div className="space-y-3">
                  {results.stories.map((s) => (
                    <Link
                      key={s.id}
                      href={`/stories/${s.id}`}
                      className="flex items-center gap-4 border border-medium-gray/20 p-4 transition-colors hover:border-purple-400/50"
                    >
                      <span className="text-lg font-mono font-bold text-purple-400 shrink-0">#</span>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{s.title}</p>
                        <p className="text-xs text-medium-gray">
                          by {s.authorName} &middot; {new Date(s.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {(tab === "all" || tab === "discussions") && discussionCount > 0 && (
              <div className="mb-8">
                {tab === "all" && (
                  <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-yellow-400">
                    Discussions
                  </h2>
                )}
                <div className="space-y-3">
                  {results.discussions.map((d) => (
                    <Link
                      key={d.id}
                      href={`/endeavors/${d.endeavorId}`}
                      className="flex items-center gap-4 border border-medium-gray/20 p-4 transition-colors hover:border-yellow-400/50"
                    >
                      <span className="text-lg font-mono font-bold text-yellow-400 shrink-0">~</span>
                      <div className="min-w-0">
                        <p className="text-sm text-light-gray truncate">{d.content.slice(0, 120)}{d.content.length > 120 ? "..." : ""}</p>
                        <p className="text-xs text-medium-gray">
                          {d.authorName} &middot; {new Date(d.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {endeavorCount === 0 && userCount === 0 && storyCount === 0 && discussionCount === 0 && (
              <div className="py-16 text-center">
                <p className="mb-2 text-lg text-medium-gray">No results found</p>
                <p className="text-sm text-medium-gray/60">
                  Try different keywords or browse{" "}
                  <Link href="/feed" className="text-code-green hover:underline">
                    all endeavors
                  </Link>
                </p>
              </div>
            )}
          </>
        )}

        {!results && !loading && (
          <div className="py-16 text-center">
            <p className="mb-4 text-medium-gray">
              Search for endeavors, people, skills, or locations
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Photography", "Hiking", "Open Source", "Music", "Film", "Research"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setQuery(tag);
                    performSearch(tag);
                    window.history.replaceState(null, "", `/search?q=${encodeURIComponent(tag)}`);
                  }}
                  className="border border-medium-gray/30 px-3 py-1.5 text-xs text-medium-gray transition-colors hover:border-code-green hover:text-code-green"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
