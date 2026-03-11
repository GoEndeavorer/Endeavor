"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

// ── Types ────────────────────────────────────────────────────────────────────

type EndeavorResult = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  locationType: string;
  imageUrl: string | null;
  memberCount: number;
};

type UserResult = {
  id: string;
  name: string;
  bio: string | null;
  image: string | null;
  skills: string[] | null;
  location: string | null;
};

type CategoryResult = {
  category: string;
  count: number;
};

type StoryResult = {
  id: string;
  title: string;
  endeavorId: string;
  authorName: string;
  createdAt: string;
};

type DiscussionResult = {
  id: string;
  content: string;
  endeavorId: string;
  authorName: string;
  createdAt: string;
};

type SearchResponse = {
  endeavors: EndeavorResult[];
  users: UserResult[];
  categories: CategoryResult[];
  stories: StoryResult[];
  discussions: DiscussionResult[];
  counts: {
    endeavors: number;
    users: number;
    categories: number;
    stories: number;
    discussions: number;
    total: number;
  };
  page: number;
  pageSize: number;
  hasMore: boolean;
};

type TabKey = "all" | "endeavors" | "people" | "categories";

// ── Helpers ──────────────────────────────────────────────────────────────────

const statusColor: Record<string, string> = {
  open: "border-code-green/60 text-code-green",
  "in-progress": "border-code-blue/60 text-code-blue",
  completed: "border-medium-gray/40 text-medium-gray",
  draft: "border-yellow-400/40 text-yellow-400",
  cancelled: "border-red-400/40 text-red-400",
};

function snippet(text: string | null, max = 140): string {
  if (!text) return "";
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "...";
}

// ── Component ────────────────────────────────────────────────────────────────

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [tab, setTab] = useState<TabKey>("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [data, setData] = useState<SearchResponse | null>(null);

  // Accumulated results for "load more" pagination
  const [endeavors, setEndeavors] = useState<EndeavorResult[]>([]);
  const [users, setUsers] = useState<UserResult[]>([]);
  const [categories, setCategories] = useState<CategoryResult[]>([]);
  const [stories, setStories] = useState<StoryResult[]>([]);
  const [discussions, setDiscussions] = useState<DiscussionResult[]>([]);

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchResults = useCallback(
    async (q: string, activeTab: TabKey, pg: number, append: boolean) => {
      if (q.length < 2) return;

      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const typeMap: Record<TabKey, string> = {
          all: "all",
          endeavors: "endeavor",
          people: "user",
          categories: "category",
        };
        const params = new URLSearchParams({
          q,
          type: typeMap[activeTab],
          page: String(pg),
        });
        const res = await fetch(`/api/search?${params.toString()}`);
        if (!res.ok) return;

        const json: SearchResponse = await res.json();
        setData(json);

        if (append) {
          setEndeavors((prev) => [...prev, ...json.endeavors]);
          setUsers((prev) => [...prev, ...json.users]);
          setCategories((prev) => [...prev, ...json.categories]);
          setStories((prev) => [...prev, ...json.stories]);
          setDiscussions((prev) => [...prev, ...json.discussions]);
        } else {
          setEndeavors(json.endeavors);
          setUsers(json.users);
          setCategories(json.categories);
          setStories(json.stories);
          setDiscussions(json.discussions);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  // Initial load from URL query param
  useEffect(() => {
    if (initialQuery.length >= 2) {
      setQuery(initialQuery);
      setPage(1);
      fetchResults(initialQuery, "all", 1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.length < 2) return;
    setTab("all");
    setPage(1);
    fetchResults(query, "all", 1, false);
    window.history.replaceState(null, "", `/search?q=${encodeURIComponent(query)}`);
  }

  function handleTabChange(newTab: TabKey) {
    setTab(newTab);
    setPage(1);
    fetchResults(query, newTab, 1, false);
  }

  function handleLoadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchResults(query, tab, nextPage, true);
  }

  // ── Counts ───────────────────────────────────────────────────────────────

  const counts = data?.counts || {
    endeavors: 0,
    users: 0,
    categories: 0,
    stories: 0,
    discussions: 0,
    total: 0,
  };

  const hasResults = data !== null;
  const isEmpty =
    hasResults &&
    counts.endeavors === 0 &&
    counts.users === 0 &&
    counts.categories === 0;

  // Tab-specific empty states
  const tabEmpty: Record<TabKey, boolean> = {
    all: isEmpty,
    endeavors: hasResults && counts.endeavors === 0,
    people: hasResults && counts.users === 0,
    categories: hasResults && counts.categories === 0,
  };

  // ── Tabs config ──────────────────────────────────────────────────────────

  const tabs: { key: TabKey; label: string; count: number; color: string }[] = [
    { key: "all", label: "All", count: counts.total, color: "code-green" },
    { key: "endeavors", label: "Endeavors", count: counts.endeavors, color: "code-green" },
    { key: "people", label: "People", count: counts.users, color: "code-blue" },
    { key: "categories", label: "Categories", count: counts.categories, color: "purple-400" },
  ];

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <AppHeader breadcrumb={{ label: "Search", href: "/search" }} />

      <main id="main-content" className="mx-auto max-w-5xl px-4 pt-24 pb-16">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="mb-6">
          <h1 className="mb-1 font-mono text-xs font-semibold uppercase tracking-widest text-medium-gray">
            // search_results
          </h1>
          {initialQuery && (
            <p className="text-lg text-white">
              Results for{" "}
              <span className="font-semibold text-code-green">
                &quot;{initialQuery}&quot;
              </span>
            </p>
          )}
        </div>

        {/* ── Search form ─────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-medium-gray">
                &gt;
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search endeavors, people, categories..."
                className="w-full border border-medium-gray/50 bg-transparent py-3 pl-8 pr-4 font-mono text-sm text-white outline-none transition-colors focus:border-code-green"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={query.length < 2}
              className="border border-code-green bg-code-green px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-black transition-colors hover:bg-transparent hover:text-code-green disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Search
            </button>
          </div>
        </form>

        {/* ── Loading skeleton ─────────────────────────────────────────── */}
        {loading && (
          <div className="space-y-4">
            <div className="flex gap-4 border-b border-medium-gray/20 pb-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 w-20 animate-pulse bg-medium-gray/10"
                />
              ))}
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse border border-medium-gray/10 p-4">
                <div className="mb-2 h-4 w-64 bg-medium-gray/10" />
                <div className="mb-1 h-3 w-48 bg-medium-gray/10" />
                <div className="h-3 w-32 bg-medium-gray/10" />
              </div>
            ))}
          </div>
        )}

        {/* ── Results ──────────────────────────────────────────────────── */}
        {hasResults && !loading && (
          <>
            {/* Tabs */}
            <div className="mb-6 flex gap-1 border-b border-medium-gray/20">
              {tabs.map((t) => {
                const isActive = tab === t.key;
                return (
                  <button
                    key={t.key}
                    onClick={() => handleTabChange(t.key)}
                    className={`relative px-4 pb-3 pt-1 font-mono text-xs font-semibold uppercase tracking-wider transition-colors ${
                      isActive
                        ? `text-${t.color} border-b-2 border-${t.color}`
                        : "text-medium-gray hover:text-white"
                    }`}
                  >
                    {t.label}
                    <span
                      className={`ml-1.5 inline-flex h-5 min-w-[20px] items-center justify-center px-1 font-mono text-[10px] ${
                        isActive
                          ? `bg-${t.color}/15 text-${t.color}`
                          : "bg-medium-gray/10 text-medium-gray"
                      }`}
                    >
                      {t.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* ── All tab ─────────────────────────────────────────────── */}
            {tab === "all" && !tabEmpty.all && (
              <div className="space-y-8">
                {/* Endeavors section */}
                {endeavors.length > 0 && (
                  <section>
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-code-green">
                        // endeavors [{counts.endeavors}]
                      </h2>
                      {counts.endeavors > endeavors.length && (
                        <button
                          onClick={() => handleTabChange("endeavors")}
                          className="font-mono text-[10px] text-medium-gray transition-colors hover:text-code-green"
                        >
                          view all &rarr;
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {endeavors.map((e) => (
                        <EndeavorCard key={e.id} endeavor={e} />
                      ))}
                    </div>
                  </section>
                )}

                {/* People section */}
                {users.length > 0 && (
                  <section>
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-code-blue">
                        // people [{counts.users}]
                      </h2>
                      {counts.users > users.length && (
                        <button
                          onClick={() => handleTabChange("people")}
                          className="font-mono text-[10px] text-medium-gray transition-colors hover:text-code-blue"
                        >
                          view all &rarr;
                        </button>
                      )}
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {users.map((u) => (
                        <PersonCard key={u.id} user={u} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Categories section */}
                {categories.length > 0 && (
                  <section>
                    <div className="mb-3 flex items-center justify-between">
                      <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-purple-400">
                        // categories [{counts.categories}]
                      </h2>
                      {counts.categories > categories.length && (
                        <button
                          onClick={() => handleTabChange("categories")}
                          className="font-mono text-[10px] text-medium-gray transition-colors hover:text-purple-400"
                        >
                          view all &rarr;
                        </button>
                      )}
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {categories.map((c) => (
                        <CategoryCard key={c.category} category={c} />
                      ))}
                    </div>
                  </section>
                )}

                {/* Stories in "All" tab */}
                {stories.length > 0 && (
                  <section>
                    <h2 className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-yellow-400">
                      // stories [{counts.stories}]
                    </h2>
                    <div className="space-y-2">
                      {stories.map((s) => (
                        <Link
                          key={s.id}
                          href={`/stories/${s.id}`}
                          className="flex items-center gap-3 border border-medium-gray/15 p-3 transition-colors hover:border-yellow-400/40"
                        >
                          <span className="shrink-0 font-mono text-sm font-bold text-yellow-400">
                            #
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">
                              {s.title}
                            </p>
                            <p className="font-mono text-[10px] text-medium-gray">
                              by {s.authorName} &middot;{" "}
                              {new Date(s.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}

                {/* Discussions in "All" tab */}
                {discussions.length > 0 && (
                  <section>
                    <h2 className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-orange-400">
                      // discussions [{counts.discussions}]
                    </h2>
                    <div className="space-y-2">
                      {discussions.map((d) => (
                        <Link
                          key={d.id}
                          href={`/endeavors/${d.endeavorId}`}
                          className="flex items-center gap-3 border border-medium-gray/15 p-3 transition-colors hover:border-orange-400/40"
                        >
                          <span className="shrink-0 font-mono text-sm font-bold text-orange-400">
                            ~
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm text-light-gray">
                              {snippet(d.content, 120)}
                            </p>
                            <p className="font-mono text-[10px] text-medium-gray">
                              {d.authorName} &middot;{" "}
                              {new Date(d.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* ── Endeavors tab ───────────────────────────────────────── */}
            {tab === "endeavors" && !tabEmpty.endeavors && (
              <div className="space-y-2">
                {endeavors.map((e) => (
                  <EndeavorCard key={e.id} endeavor={e} />
                ))}
              </div>
            )}

            {/* ── People tab ──────────────────────────────────────────── */}
            {tab === "people" && !tabEmpty.people && (
              <div className="grid gap-2 sm:grid-cols-2">
                {users.map((u) => (
                  <PersonCard key={u.id} user={u} />
                ))}
              </div>
            )}

            {/* ── Categories tab ──────────────────────────────────────── */}
            {tab === "categories" && !tabEmpty.categories && (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((c) => (
                  <CategoryCard key={c.category} category={c} />
                ))}
              </div>
            )}

            {/* ── Empty states per tab ─────────────────────────────────── */}
            {tabEmpty[tab] && (
              <EmptyState tab={tab} query={query} />
            )}

            {/* ── Load more ───────────────────────────────────────────── */}
            {data?.hasMore && !tabEmpty[tab] && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="border border-code-green/50 px-8 py-3 font-mono text-xs font-semibold uppercase tracking-wider text-code-green transition-colors hover:bg-code-green hover:text-black disabled:opacity-40"
                >
                  {loadingMore ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-block h-3 w-3 animate-spin border border-code-green border-t-transparent" />
                      loading...
                    </span>
                  ) : (
                    "Load more"
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Initial state (no search yet) ───────────────────────────── */}
        {!hasResults && !loading && (
          <div className="py-16 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border border-medium-gray/20">
              <span className="font-mono text-2xl text-medium-gray">&gt;_</span>
            </div>
            <p className="mb-2 text-sm text-medium-gray">
              Search for endeavors, people, or categories
            </p>
            <p className="mb-6 font-mono text-xs text-medium-gray/60">
              type at least 2 characters to begin
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "Photography",
                "Hiking",
                "Open Source",
                "Music",
                "Film",
                "Research",
                "Community",
                "Tech",
              ].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setQuery(tag);
                    setTab("all");
                    setPage(1);
                    fetchResults(tag, "all", 1, false);
                    window.history.replaceState(
                      null,
                      "",
                      `/search?q=${encodeURIComponent(tag)}`
                    );
                  }}
                  className="border border-medium-gray/20 px-3 py-1.5 font-mono text-xs text-medium-gray transition-colors hover:border-code-green hover:text-code-green"
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

// ── Sub-components ───────────────────────────────────────────────────────────

function EndeavorCard({ endeavor: e }: { endeavor: EndeavorResult }) {
  return (
    <Link
      href={`/endeavors/${e.id}`}
      className="group flex items-start gap-4 border border-medium-gray/15 p-4 transition-colors hover:border-code-green/40"
    >
      {/* Thumbnail / initial */}
      {e.imageUrl ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={e.imageUrl}
          alt=""
          className="h-14 w-20 shrink-0 object-cover"
        />
      ) : (
        <div className="flex h-14 w-20 shrink-0 items-center justify-center bg-code-green/5 font-mono text-lg font-bold text-code-green">
          {e.title.charAt(0)}
        </div>
      )}

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <p className="truncate font-semibold transition-colors group-hover:text-code-green">
            {e.title}
          </p>
          <span
            className={`shrink-0 border px-1.5 py-0.5 font-mono text-[10px] uppercase ${
              statusColor[e.status] || "border-medium-gray/30 text-medium-gray"
            }`}
          >
            {e.status}
          </span>
        </div>

        <p className="mb-2 text-xs leading-relaxed text-medium-gray line-clamp-2">
          {snippet(e.description)}
        </p>

        <div className="flex items-center gap-3 font-mono text-[10px] text-medium-gray">
          <span className="text-code-green/80">{e.category}</span>
          <span>&middot;</span>
          <span>{e.memberCount} member{e.memberCount !== 1 ? "s" : ""}</span>
          <span>&middot;</span>
          <span>{e.locationType}</span>
        </div>
      </div>
    </Link>
  );
}

function PersonCard({ user: u }: { user: UserResult }) {
  return (
    <Link
      href={`/users/${u.id}`}
      className="group flex items-start gap-3 border border-medium-gray/15 p-4 transition-colors hover:border-code-blue/40"
    >
      {/* Avatar */}
      {u.image ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={u.image}
          alt=""
          className="h-10 w-10 shrink-0 object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-code-blue/10 font-mono text-sm font-bold text-code-blue">
          {u.name.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-2">
          <p className="truncate font-semibold transition-colors group-hover:text-code-blue">
            {u.name}
          </p>
          {u.location && (
            <span className="shrink-0 font-mono text-[10px] text-medium-gray">
              {u.location}
            </span>
          )}
        </div>

        {u.bio && (
          <p className="mb-2 text-xs leading-relaxed text-medium-gray line-clamp-2">
            {snippet(u.bio, 100)}
          </p>
        )}

        {u.skills && u.skills.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {u.skills.slice(0, 5).map((s) => (
              <span
                key={s}
                className="border border-code-blue/20 px-1.5 py-0.5 font-mono text-[10px] text-code-blue"
              >
                {s}
              </span>
            ))}
            {u.skills.length > 5 && (
              <span className="font-mono text-[10px] text-medium-gray">
                +{u.skills.length - 5}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

function CategoryCard({ category: c }: { category: CategoryResult }) {
  const colorMap: Record<string, { border: string; text: string }> = {
    Adventure: { border: "border-code-green/40", text: "text-code-green" },
    Scientific: { border: "border-code-blue/40", text: "text-code-blue" },
    Creative: { border: "border-yellow-400/40", text: "text-yellow-400" },
    Tech: { border: "border-purple-400/40", text: "text-purple-400" },
    Cultural: { border: "border-orange-400/40", text: "text-orange-400" },
    Community: { border: "border-pink-400/40", text: "text-pink-400" },
  };

  const colors = colorMap[c.category] || {
    border: "border-medium-gray/30",
    text: "text-white",
  };

  return (
    <Link
      href={`/feed?category=${encodeURIComponent(c.category)}`}
      className={`group flex items-center justify-between border p-4 transition-colors hover:bg-white/[0.02] ${colors.border}`}
    >
      <div>
        <p className={`font-semibold ${colors.text}`}>{c.category}</p>
        <p className="font-mono text-[10px] text-medium-gray">
          category.match
        </p>
      </div>
      <div className="text-right">
        <p className="font-mono text-lg font-bold text-white">{c.count}</p>
        <p className="font-mono text-[10px] text-medium-gray">
          endeavor{c.count !== 1 ? "s" : ""}
        </p>
      </div>
    </Link>
  );
}

function EmptyState({ tab, query }: { tab: TabKey; query: string }) {
  const messages: Record<TabKey, { title: string; desc: string }> = {
    all: {
      title: "No results found",
      desc: `Nothing matched "${query}". Try different keywords or browse all endeavors.`,
    },
    endeavors: {
      title: "No endeavors found",
      desc: `No endeavors match "${query}". Try broadening your search or create a new endeavor.`,
    },
    people: {
      title: "No people found",
      desc: `No users match "${query}". Try searching by name, skill, or interest.`,
    },
    categories: {
      title: "No categories found",
      desc: `No categories match "${query}". Try a broader category name like "Tech" or "Creative".`,
    },
  };

  const msg = messages[tab];

  return (
    <div className="py-16 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-medium-gray/20">
        <span className="font-mono text-lg text-medium-gray/50">0</span>
      </div>
      <p className="mb-2 text-sm text-medium-gray">{msg.title}</p>
      <p className="mx-auto max-w-sm font-mono text-xs text-medium-gray/60">
        {msg.desc}
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          href="/feed"
          className="border border-code-green/50 px-4 py-2 font-mono text-xs text-code-green transition-colors hover:bg-code-green hover:text-black"
        >
          Browse All
        </Link>
        <Link
          href="/explore"
          className="border border-medium-gray/30 px-4 py-2 font-mono text-xs text-medium-gray transition-colors hover:border-code-green hover:text-code-green"
        >
          Explore
        </Link>
      </div>
    </div>
  );
}
