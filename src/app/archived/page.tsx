"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { formatTimeAgo } from "@/lib/time";

type ArchivedEndeavor = {
  id: string;
  title: string;
  category: string;
  status: string;
  imageUrl: string | null;
  tagline: string | null;
  updatedAt: string;
  memberCount: number;
  creatorName: string;
};

type StatusFilter = "all" | "completed" | "cancelled";

const PAGE_SIZE = 20;

export default function ArchivedPage() {
  const [endeavors, setEndeavors] = useState<ArchivedEndeavor[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const sentinelRef = useRef<HTMLDivElement>(null);

  const fetchEndeavors = useCallback(
    async (offset: number, append: boolean) => {
      if (append) setLoadingMore(true);
      else setLoading(true);

      try {
        const params = new URLSearchParams({
          limit: String(PAGE_SIZE),
          offset: String(offset),
        });
        if (filter !== "all") params.set("status", filter);

        const res = await fetch(`/api/endeavors/archived?${params}`);
        if (!res.ok) return;
        const data = await res.json();

        if (append) {
          setEndeavors((prev) => [...prev, ...data.endeavors]);
        } else {
          setEndeavors(data.endeavors);
        }
        setHasMore(data.hasMore);
        setTotal(data.total);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [filter]
  );

  // Reset and fetch when filter changes
  useEffect(() => {
    fetchEndeavors(0, false);
  }, [fetchEndeavors]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchEndeavors(endeavors.length, true);
        }
      },
      { rootMargin: "200px" }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, endeavors.length, fetchEndeavors]);

  const filterButtons: { label: string; value: StatusFilter }[] = [
    { label: "All", value: "all" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  return (
    <>
      <AppHeader breadcrumb={{ label: "Archived", href: "/archived" }} />
      <main className="mx-auto max-w-5xl px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-code-green mb-2">
            {"// archived endeavors"}
          </p>
          <h1 className="text-2xl font-bold mb-1">Archive</h1>
          <p className="text-sm text-medium-gray">
            Completed and cancelled endeavors. Browse past projects and their outcomes.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex items-center gap-4 border-b border-medium-gray/20 pb-4">
          <span className="text-xs text-medium-gray">Filter:</span>
          <div className="flex gap-2">
            {filterButtons.map((fb) => (
              <button
                key={fb.value}
                onClick={() => setFilter(fb.value)}
                className={`px-3 py-1 text-xs font-medium transition-colors ${
                  filter === fb.value
                    ? "border border-code-green text-code-green"
                    : "border border-medium-gray/30 text-medium-gray hover:border-code-green/50 hover:text-code-green"
                }`}
              >
                {fb.label}
              </button>
            ))}
          </div>
          {!loading && (
            <span className="ml-auto text-xs text-medium-gray">
              {total} {total === 1 ? "endeavor" : "endeavors"}
            </span>
          )}
        </div>

        {/* Loading skeleton */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse border border-medium-gray/20 p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="h-16 w-20 bg-medium-gray/10 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 bg-medium-gray/10" />
                    <div className="h-3 w-1/2 bg-medium-gray/10" />
                    <div className="h-3 w-1/3 bg-medium-gray/10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : endeavors.length === 0 ? (
          /* Empty state */
          <div className="py-20 text-center border border-medium-gray/20">
            <div className="text-4xl mb-4 text-medium-gray/40">{"{ }"}</div>
            <p className="text-medium-gray mb-2">
              {filter === "all"
                ? "No archived endeavors yet."
                : `No ${filter} endeavors found.`}
            </p>
            <Link
              href="/feed"
              className="mt-2 inline-block text-sm text-code-green hover:underline"
            >
              Explore active endeavors &rarr;
            </Link>
          </div>
        ) : (
          /* Endeavor cards */
          <div className="space-y-3">
            {endeavors.map((e) => (
              <Link
                key={e.id}
                href={`/endeavors/${e.id}`}
                className="group flex items-start gap-4 border border-medium-gray/20 p-4 transition-colors hover:border-code-green/30"
              >
                {/* Thumbnail */}
                {e.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={e.imageUrl}
                    alt=""
                    className="h-16 w-20 object-cover shrink-0 grayscale group-hover:grayscale-0 transition-all"
                  />
                ) : (
                  <div className="flex h-16 w-20 items-center justify-center bg-medium-gray/10 shrink-0 text-xl font-bold text-medium-gray">
                    {e.title.charAt(0)}
                  </div>
                )}

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold truncate group-hover:text-code-green transition-colors">
                      {e.title}
                    </p>
                    <span
                      className={`shrink-0 text-[10px] font-semibold uppercase tracking-wider border px-2 py-0.5 ${
                        e.status === "completed"
                          ? "border-code-blue/40 text-code-blue"
                          : "border-medium-gray/30 text-medium-gray"
                      }`}
                    >
                      {e.status}
                    </span>
                  </div>
                  {e.tagline && (
                    <p className="text-sm text-medium-gray mt-0.5 truncate">
                      {e.tagline}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-xs text-medium-gray">
                    <span>{e.category}</span>
                    <span className="text-medium-gray/40">&middot;</span>
                    <span>
                      {e.memberCount} {e.memberCount === 1 ? "member" : "members"}
                    </span>
                    <span className="text-medium-gray/40">&middot;</span>
                    <span>by {e.creatorName}</span>
                    <span className="text-medium-gray/40">&middot;</span>
                    <span>{formatTimeAgo(e.updatedAt)}</span>
                  </div>
                </div>
              </Link>
            ))}

            {/* Infinite scroll sentinel */}
            <div ref={sentinelRef} />

            {/* Loading more indicator */}
            {loadingMore && (
              <div className="py-4 text-center">
                <span className="text-xs text-medium-gray animate-pulse">
                  Loading more...
                </span>
              </div>
            )}

            {/* End of list */}
            {!hasMore && endeavors.length > 0 && (
              <div className="py-6 text-center border-t border-medium-gray/10">
                <p className="text-xs text-medium-gray">
                  {"// end of archive"} &mdash; {total} total
                </p>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
