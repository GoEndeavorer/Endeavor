"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/time";

type FeedItem = {
  type: string;
  message: string;
  userId: string;
  userName: string;
  createdAt: string;
};

const typeIcons: Record<string, string> = {
  member: "+",
  discussion: "#",
  task: ">",
  milestone: "*",
  story: "~",
};

export function MemberFeed({ endeavorId }: { endeavorId: string }) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchItems = useCallback(
    async (cursor?: string) => {
      const url = cursor
        ? `/api/endeavors/${endeavorId}/activity-feed?cursor=${encodeURIComponent(cursor)}`
        : `/api/endeavors/${endeavorId}/activity-feed`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    [endeavorId]
  );

  useEffect(() => {
    fetchItems()
      .then((data) => {
        setItems(data);
        setHasMore(data.length === 20);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [fetchItems]);

  const loadMore = async () => {
    if (loadingMore || items.length === 0) return;
    setLoadingMore(true);
    try {
      const cursor = items[items.length - 1].createdAt;
      const next = await fetchItems(cursor);
      setItems((prev) => [...prev, ...next]);
      setHasMore(next.length === 20);
    } catch {
      // ignore
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-2 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-2 py-2"
          >
            <div className="mt-0.5 h-3 w-3 shrink-0 bg-medium-gray/10" />
            <div className="flex-1 space-y-1">
              <div className="h-3 w-3/4 bg-medium-gray/10" />
              <div className="h-2 w-16 bg-medium-gray/10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="border border-medium-gray/20 p-6 text-center">
        <p className="font-mono text-xs text-medium-gray">
          No activity yet.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-0">
        {items.map((item, i) => {
          const icon = typeIcons[item.type] || ">";
          return (
            <div
              key={`${item.createdAt}-${i}`}
              className="relative flex items-start gap-2 border-b border-medium-gray/20 py-2 last:border-b-0"
            >
              {/* timeline connector */}
              {i < items.length - 1 && (
                <span className="absolute left-[5px] top-6 h-full w-px bg-medium-gray/20" />
              )}
              <span className="mt-0.5 shrink-0 font-mono text-xs font-bold text-code-green">
                {icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-mono text-xs text-light-gray">
                  {item.userId ? (
                    <>
                      <Link
                        href={`/users/${item.userId}`}
                        className="text-code-blue hover:text-code-green"
                      >
                        {item.userName}
                      </Link>{" "}
                    </>
                  ) : null}
                  {item.message}
                </p>
                <p className="mt-0.5 font-mono text-[10px] text-medium-gray">
                  {formatTimeAgo(item.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loadingMore}
          className="mt-3 w-full border border-medium-gray/20 py-2 font-mono text-xs text-medium-gray hover:text-light-gray hover:border-medium-gray/40 transition-colors disabled:opacity-50"
        >
          {loadingMore ? "loading..." : "Load more"}
        </button>
      )}
    </div>
  );
}
