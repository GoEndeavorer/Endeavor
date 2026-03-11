"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/time";

type TimelineItem = {
  id: string;
  type: string;
  title: string;
  detail: string | null;
  endeavorId: string | null;
  createdAt: string;
};

const typeConfig: Record<string, { icon: string; color: string; label: string }> = {
  endeavor_created: { icon: "+", color: "text-code-green", label: "Created endeavor" },
  joined_endeavor: { icon: ">", color: "text-code-blue", label: "Joined" },
  discussion: { icon: "#", color: "text-yellow-400", label: "Discussed" },
  story_published: { icon: "~", color: "text-purple-400", label: "Published story" },
  milestone_completed: { icon: "*", color: "text-code-green", label: "Completed milestone" },
};

export function UserTimeline({ userId }: { userId: string }) {
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetch(`/api/users/${userId}/timeline?limit=15`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setItems(arr);
        setHasMore(arr.length >= 15);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  function loadMore() {
    fetch(`/api/users/${userId}/timeline?limit=15&offset=${items.length}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setItems((prev) => [...prev, ...arr]);
        setHasMore(arr.length >= 15);
      })
      .catch(() => {});
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 animate-pulse bg-medium-gray/10" />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-xs text-medium-gray text-center py-4">
        No activity yet.
      </p>
    );
  }

  return (
    <div>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
        {"// activity timeline"}
      </h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-medium-gray/20" />

        <div className="space-y-0">
          {items.map((item) => {
            const config = typeConfig[item.type] || {
              icon: ">",
              color: "text-medium-gray",
              label: item.type,
            };
            return (
              <div key={`${item.type}-${item.id}`} className="relative flex items-start gap-3 py-2 pl-0">
                <span
                  className={`relative z-10 mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center bg-black font-mono text-xs font-bold ${config.color}`}
                >
                  {config.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-light-gray">
                    <span className="text-medium-gray">{config.label}</span>{" "}
                    {item.endeavorId ? (
                      <Link
                        href={`/endeavors/${item.endeavorId}`}
                        className="text-code-blue hover:text-code-green"
                      >
                        {item.title}
                      </Link>
                    ) : (
                      item.title
                    )}
                  </p>
                  <span className="text-[10px] text-medium-gray">
                    {formatTimeAgo(item.createdAt)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {hasMore && (
        <button
          onClick={loadMore}
          className="mt-3 w-full border border-medium-gray/20 py-2 text-xs text-medium-gray hover:border-code-green/30 hover:text-code-green transition-colors"
        >
          Load more
        </button>
      )}
    </div>
  );
}
