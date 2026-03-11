"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { CardSkeletonGrid } from "@/components/skeleton";
import { getRecentlyViewed } from "@/lib/recently-viewed";
import { analytics } from "@/lib/analytics";
import { MostActiveSidebar } from "@/components/most-active-sidebar";
import { Recommendations } from "@/components/recommendations";
import { RecentlyViewed } from "@/components/recently-viewed";
import { FollowSuggestions } from "@/components/follow-suggestions";
import { SkillMatches } from "@/components/skill-matches";

type Endeavor = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string | null;
  locationType: string;
  status: string;
  needs: string[] | null;
  costPerPerson: number | null;
  capacity: number | null;
  fundingEnabled: boolean;
  fundingGoal: number | null;
  fundingRaised: number;
  imageUrl: string | null;
  memberCount: number;
  createdAt: string;
};

const categories = [
  "All",
  "Adventure",
  "Scientific",
  "Creative",
  "Tech",
  "Cultural",
  "Community",
];

const locationTypes = [
  { value: "", label: "Any" },
  { value: "in-person", label: "In-Person" },
  { value: "remote", label: "Remote" },
  { value: "either", label: "Either" },
];

function EndeavorCard({ endeavor }: { endeavor: Endeavor }) {
  const categoryColors: Record<string, string> = {
    Scientific: "border-code-blue text-code-blue",
    Tech: "border-purple-400 text-purple-400",
    Creative: "border-yellow-400 text-yellow-400",
    Adventure: "border-code-green text-code-green",
    Cultural: "border-orange-400 text-orange-400",
    Community: "border-pink-400 text-pink-400",
  };

  return (
    <Link
      href={`/endeavors/${endeavor.id}`}
      className="group flex flex-col border border-medium-gray/30 transition-colors hover:border-code-green/50 overflow-hidden"
    >
      {endeavor.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={endeavor.imageUrl}
          alt=""
          className="h-36 w-full object-cover"
          loading="lazy"
        />
      )}
      <div className="flex flex-col flex-1 p-5">
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`border px-2 py-0.5 text-xs uppercase ${
            categoryColors[endeavor.category] ||
            "border-medium-gray text-medium-gray"
          }`}
        >
          {endeavor.category}
        </span>
        <span className="text-xs text-medium-gray">
          {endeavor.locationType === "in-person"
            ? "In-Person"
            : endeavor.locationType === "remote"
            ? "Remote"
            : "In-Person / Remote"}
        </span>
        {endeavor.status && endeavor.status !== "open" && (
          <span className={`text-xs ${
            endeavor.status === "completed" ? "text-code-green" :
            endeavor.status === "in-progress" ? "text-code-blue" :
            endeavor.status === "cancelled" ? "text-red-400" :
            "text-medium-gray"
          }`}>
            {endeavor.status}
          </span>
        )}
      </div>

      <h3 className="mb-1 text-lg font-bold">{endeavor.title}</h3>
      {endeavor.location && (
        <p className="mb-1 text-xs text-medium-gray">{endeavor.location}</p>
      )}
      <p className="mb-4 flex-1 text-sm leading-relaxed text-light-gray line-clamp-3">
        {endeavor.description}
      </p>

      {endeavor.needs && endeavor.needs.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {endeavor.needs.slice(0, 3).map((need) => (
            <span
              key={need}
              className="bg-white/5 px-2 py-0.5 text-xs text-light-gray"
            >
              {need}
            </span>
          ))}
          {endeavor.needs.length > 3 && (
            <span className="px-2 py-0.5 text-xs text-medium-gray">
              +{endeavor.needs.length - 3} more
            </span>
          )}
        </div>
      )}

      <div className="mt-auto">
        {endeavor.costPerPerson !== null && endeavor.costPerPerson > 0 && (
          <p className="text-sm font-semibold text-code-green">
            ${endeavor.costPerPerson.toLocaleString()}/person
          </p>
        )}
        {endeavor.costPerPerson === 0 && (
          <p className="text-sm font-semibold text-code-green">Free to join</p>
        )}
        {endeavor.fundingEnabled &&
          endeavor.fundingGoal &&
          endeavor.fundingGoal > 0 && (
            <div className="mt-2">
              <div className="mb-1 flex justify-between text-xs text-medium-gray">
                <span>${endeavor.fundingRaised.toLocaleString()} raised</span>
                <span>
                  {Math.round(
                    (endeavor.fundingRaised / endeavor.fundingGoal) * 100
                  )}
                  % of ${endeavor.fundingGoal.toLocaleString()}
                </span>
              </div>
              <div className="h-1 w-full bg-medium-gray/30">
                <div
                  className="h-1 bg-code-green"
                  style={{
                    width: `${Math.min(
                      100,
                      (endeavor.fundingRaised / endeavor.fundingGoal) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-medium-gray/20 pt-3">
        <span className="text-xs text-medium-gray">
          {endeavor.memberCount} joined
          {endeavor.capacity ? ` / ${endeavor.capacity} spots` : ""}
        </span>
        <span className="text-xs font-semibold text-code-blue transition-colors group-hover:text-code-green">
          View &rarr;
        </span>
      </div>
      </div>
    </Link>
  );
}

export default function FeedPage() {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [endeavors, setEndeavors] = useState<Endeavor[]>([]);
  const [recommended, setRecommended] = useState<Endeavor[]>([]);
  const [trending, setTrending] = useState<Endeavor[]>([]);
  const [forYou, setForYou] = useState<Endeavor[]>([]);
  const [forYouLoading, setForYouLoading] = useState(false);
  const [trendingNeeds, setTrendingNeeds] = useState<{ need: string; count: string }[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<{ id: string; title: string; category: string; imageUrl: string | null }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") || "All");
  const [locationType, setLocationType] = useState("");
  const [sort, setSort] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [feedTab, setFeedTab] = useState<"explore" | "for-you">("explore");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const PAGE_SIZE = 20;

  const scrollStateRef = useRef({ hasMore, loadingMore, loading, length: endeavors.length });
  scrollStateRef.current = { hasMore, loadingMore, loading, length: endeavors.length };
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Debounce search input
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const fetchEndeavors = useCallback(async (offset = 0) => {
    if (offset === 0) setLoading(true);
    else setLoadingMore(true);

    const params = new URLSearchParams();
    if (category !== "All") params.set("category", category);
    if (locationType) params.set("locationType", locationType);
    if (sort !== "newest") params.set("sort", sort);
    if (debouncedSearch) params.set("search", debouncedSearch);
    params.set("limit", String(PAGE_SIZE));
    params.set("offset", String(offset));

    try {
      if (debouncedSearch) {
        analytics.searchPerformed(debouncedSearch, category !== "All" ? category : undefined);
      }
      const res = await fetch(`/api/endeavors?${params}`);
      const data = await res.json();
      if (offset === 0) {
        setEndeavors(data);
      } else {
        setEndeavors((prev) => [...prev, ...data]);
      }
      setHasMore(data.length === PAGE_SIZE);
    } catch (err) {
      console.error("Failed to fetch endeavors:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [category, locationType, sort, debouncedSearch]);

  const fetchRef = useRef(fetchEndeavors);
  fetchRef.current = fetchEndeavors;

  const loadMoreCallbackRef = useCallback((node: HTMLDivElement | null) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (!node) return;
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const s = scrollStateRef.current;
        if (entries[0].isIntersecting && s.hasMore && !s.loadingMore && !s.loading) {
          fetchRef.current(s.length);
        }
      },
      { rootMargin: "200px" }
    );
    observerRef.current.observe(node);
  }, []);

  useEffect(() => {
    fetchEndeavors();
  }, [fetchEndeavors]);

  // Load recently viewed from localStorage
  useEffect(() => {
    setRecentlyViewed(getRecentlyViewed());
  }, []);

  // Fetch trending and recommended on mount
  useEffect(() => {
    fetch("/api/endeavors/trending")
      .then((r) => r.json())
      .then(setTrending)
      .catch(() => {});
    fetch("/api/endeavors/trending-needs")
      .then((r) => r.json())
      .then(setTrendingNeeds)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (session) {
      fetch("/api/endeavors/recommended")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setRecommended(data);
        })
        .catch(() => {});
    }
  }, [session]);

  // Fetch "For You" personalized feed
  useEffect(() => {
    if (session && feedTab === "for-you" && forYou.length === 0) {
      setForYouLoading(true);
      fetch("/api/feed/for-you")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setForYou(data);
        })
        .catch(() => {})
        .finally(() => setForYouLoading(false));
    }
  }, [session, feedTab, forYou.length]);

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Explore", href: "/feed" }} />

      <main id="main-content" className="mx-auto max-w-7xl px-4 pt-24 pb-16">
        <div className="flex gap-8">
        <div className="min-w-0 flex-1">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Explore Endeavors</h1>
          <Link
            href="/categories"
            className="text-sm text-medium-gray hover:text-code-green"
          >
            Browse Categories
          </Link>
        </div>

        {/* Feed tabs */}
        {session && (
          <div className="mb-8 flex gap-1 border-b border-medium-gray/20">
            <button
              onClick={() => setFeedTab("explore")}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${
                feedTab === "explore"
                  ? "border-b-2 border-code-green text-code-green"
                  : "text-medium-gray hover:text-white"
              }`}
            >
              Explore
            </button>
            <button
              onClick={() => setFeedTab("for-you")}
              className={`px-4 py-2 text-sm font-semibold transition-colors ${
                feedTab === "for-you"
                  ? "border-b-2 border-code-green text-code-green"
                  : "text-medium-gray hover:text-white"
              }`}
            >
              For You
            </button>
          </div>
        )}

        {/* For You tab */}
        {feedTab === "for-you" && session && (
          <div>
            {forYouLoading ? (
              <CardSkeletonGrid count={6} />
            ) : forYou.length === 0 ? (
              <div className="border border-medium-gray/20 p-12 text-center">
                <p className="mb-2 text-lg text-medium-gray">No personalized suggestions yet.</p>
                <p className="mb-6 text-sm text-medium-gray">Add interests and skills to your profile to get matched with relevant endeavors.</p>
                <Link
                  href="/profile"
                  className="border border-code-green px-6 py-3 text-sm font-bold uppercase text-code-green transition-colors hover:bg-code-green hover:text-black"
                >
                  Complete Profile
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {forYou.map((e) => (
                  <EndeavorCard key={e.id} endeavor={e as Endeavor} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Explore tab content */}
        {feedTab === "explore" && <>
        {/* Profile completion prompt */}
        {session && recommended.length === 0 && (
          <div className="mb-8 border border-code-blue/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-code-blue">Complete your profile for personalized recommendations</p>
                <p className="text-xs text-medium-gray">Add skills and interests to see endeavors matched to you.</p>
              </div>
              <Link
                href="/profile"
                className="flex-shrink-0 border border-code-blue px-4 py-2 text-xs font-bold uppercase text-code-blue transition-colors hover:bg-code-blue hover:text-black"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        )}

        {/* Recommended for you */}
        {session && recommended.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-code-green">
              {"// recommended for you"}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recommended.slice(0, 3).map((e) => (
                <EndeavorCard key={e.id} endeavor={e} />
              ))}
            </div>
          </div>
        )}

        {/* Trending */}
        {trending.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-code-blue">
              {"// trending"}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {trending.slice(0, 3).map((e) => (
                <EndeavorCard key={e.id} endeavor={e} />
              ))}
            </div>
          </div>
        )}

        {/* Trending needs */}
        {trendingNeeds.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-yellow-400">
              {"// most wanted"}
            </h2>
            <div className="flex flex-wrap gap-2">
              {trendingNeeds.map((n) => (
                <button
                  key={n.need}
                  onClick={() => setSearch(n.need)}
                  className="border border-yellow-400/30 bg-yellow-400/5 px-3 py-1.5 text-xs text-yellow-400 transition-colors hover:bg-yellow-400/10"
                >
                  {n.need}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recently viewed */}
        {recentlyViewed.length > 0 && !search && category === "All" && (
          <div className="mb-8">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-medium-gray">
              {"// recently viewed"}
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {recentlyViewed.slice(0, 5).map((r) => (
                <Link
                  key={r.id}
                  href={`/endeavors/${r.id}`}
                  className="flex-shrink-0 w-40 border border-medium-gray/20 overflow-hidden transition-colors hover:border-code-green/50 group"
                >
                  {r.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.imageUrl} alt="" className="h-20 w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-20 items-center justify-center bg-code-green/5 text-xl font-bold text-code-green/20">
                      {r.title.charAt(0)}
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-xs font-semibold truncate group-hover:text-code-green transition-colors">{r.title}</p>
                    <p className="text-[10px] text-medium-gray">{r.category}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, description, or needed skills..."
            className="w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`border px-3 py-1.5 text-xs font-semibold uppercase transition-colors ${
                  category === cat
                    ? "border-code-green bg-code-green text-black"
                    : "border-medium-gray/50 text-medium-gray hover:border-code-green hover:text-code-green"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {locationTypes.map((lt) => (
              <button
                key={lt.value}
                onClick={() => setLocationType(lt.value)}
                className={`border px-3 py-1.5 text-xs uppercase transition-colors ${
                  locationType === lt.value
                    ? "border-code-blue bg-code-blue text-black font-semibold"
                    : "border-medium-gray/50 text-medium-gray hover:border-code-blue hover:text-code-blue"
                }`}
              >
                {lt.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-medium-gray">Sort:</span>
            {[
              { value: "newest", label: "Newest" },
              { value: "popular", label: "Popular" },
              { value: "oldest", label: "Oldest" },
              { value: "funded", label: "Most Funded" },
            ].map((s) => (
              <button
                key={s.value}
                onClick={() => setSort(s.value)}
                className={`border px-3 py-1.5 text-xs uppercase transition-colors ${
                  sort === s.value
                    ? "border-code-green text-code-green font-semibold"
                    : "border-medium-gray/50 text-medium-gray hover:border-code-green hover:text-code-green"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-medium-gray">View:</span>
            <button
              onClick={() => setViewMode("grid")}
              className={`border px-3 py-1.5 text-xs uppercase transition-colors ${
                viewMode === "grid" ? "border-code-green text-code-green font-semibold" : "border-medium-gray/50 text-medium-gray hover:border-code-green hover:text-code-green"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`border px-3 py-1.5 text-xs uppercase transition-colors ${
                viewMode === "list" ? "border-code-green text-code-green font-semibold" : "border-medium-gray/50 text-medium-gray hover:border-code-green hover:text-code-green"
              }`}
            >
              List
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <CardSkeletonGrid count={6} />
        ) : endeavors.length === 0 ? (
          <div className="py-20 text-center">
            <p className="mb-4 text-lg text-medium-gray">
              No endeavors found.
            </p>
            {session && (
              <Link
                href="/endeavors/create"
                className="border border-code-green px-6 py-3 text-sm font-bold uppercase text-code-green transition-colors hover:bg-code-green hover:text-black"
              >
                Create the first one
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-3"}>
              {endeavors.map((e) =>
                viewMode === "grid" ? (
                  <EndeavorCard key={e.id} endeavor={e} />
                ) : (
                  <Link
                    key={e.id}
                    href={`/endeavors/${e.id}`}
                    className="flex items-center gap-4 border border-medium-gray/20 p-4 transition-colors hover:border-code-green/50"
                  >
                    {e.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={e.imageUrl} alt="" className="h-14 w-20 object-cover shrink-0" />
                    ) : (
                      <div className="flex h-14 w-20 items-center justify-center bg-code-green/10 shrink-0 text-xl font-bold text-code-green/30">
                        {e.title.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold truncate">{e.title}</p>
                      <p className="text-xs text-medium-gray">
                        {e.category} &middot; {e.status} &middot; {e.memberCount} member{e.memberCount !== 1 ? "s" : ""}
                        {e.location && ` &middot; ${e.location}`}
                      </p>
                    </div>
                    <span className="text-xs text-code-green shrink-0">&rarr;</span>
                  </Link>
                )
              )}
            </div>
            {hasMore && (
              <div ref={loadMoreCallbackRef} className="mt-8 flex justify-center py-4">
                {loadingMore && (
                  <span className="text-xs text-medium-gray animate-pulse">Loading more...</span>
                )}
              </div>
            )}
          </>
        )}
        </>}
        </div>
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 space-y-8">
            <MostActiveSidebar />
            <Recommendations />
            <RecentlyViewed />
            <FollowSuggestions />
            <SkillMatches />
            {trendingNeeds.length > 0 && (
              <div>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-yellow-400">
                  {"// skills in demand"}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {trendingNeeds.slice(0, 8).map((n) => (
                    <button
                      key={n.need}
                      onClick={() => { setFeedTab("explore"); setSearch(n.need); }}
                      className="border border-yellow-400/20 bg-yellow-400/5 px-2 py-1 text-xs text-yellow-400 transition-colors hover:bg-yellow-400/10"
                    >
                      {n.need}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-medium-gray">
                {"// quick links"}
              </h3>
              <div className="space-y-1.5">
                <Link href="/discover" className="block text-sm text-medium-gray hover:text-code-green transition-colors">Discovery Hub</Link>
                <Link href="/leaderboard" className="block text-sm text-medium-gray hover:text-code-green transition-colors">Leaderboard</Link>
                <Link href="/hiring" className="block text-sm text-medium-gray hover:text-code-green transition-colors">Who&apos;s Hiring</Link>
                <Link href="/tags" className="block text-sm text-medium-gray hover:text-code-green transition-colors">Browse Tags</Link>
                <Link href="/categories" className="block text-sm text-medium-gray hover:text-code-green transition-colors">Categories</Link>
              </div>
            </div>
          </div>
        </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
