"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { formatTimeAgo } from "@/lib/time";

type ActivityItem = {
  type: string;
  title: string;
  detail: string | null;
  endeavorId: string;
  endeavorTitle: string;
  createdAt: string;
};

const typeConfig: Record<
  string,
  { color: string; label: string; icon: string }
> = {
  task_completed: { color: "text-code-green", label: "TASK DONE", icon: "+" },
  discussion: { color: "text-code-blue", label: "DISCUSSION", icon: ">" },
  story: { color: "text-purple-400", label: "STORY", icon: "~" },
  joined: { color: "text-yellow-400", label: "JOINED", icon: "*" },
  endorsement: { color: "text-orange-400", label: "ENDORSED", icon: "#" },
};

const filterOptions = [
  { value: "all", label: "All" },
  { value: "task_completed", label: "Tasks" },
  { value: "discussion", label: "Discussions" },
  { value: "story", label: "Stories" },
  { value: "joined", label: "Joined" },
  { value: "endorsement", label: "Endorsements" },
];

function groupByDate(items: ActivityItem[]): Record<string, ActivityItem[]> {
  const groups: Record<string, ActivityItem[]> = {};
  for (const item of items) {
    const date = new Date(item.createdAt);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let key: string;
    if (date.toDateString() === today.toDateString()) {
      key = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      key = "Yesterday";
    } else {
      key = date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }

    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }
  return groups;
}

export default function ActivityLogPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState("all");
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const fetchItems = useCallback(
    async (cursor?: string) => {
      const params = new URLSearchParams();
      if (cursor) params.set("cursor", cursor);
      const res = await fetch(`/api/activity-log?${params.toString()}`);
      if (!res.ok) return;
      const data = await res.json();
      return data as { items: ActivityItem[]; nextCursor: string | null };
    },
    []
  );

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    fetchItems()
      .then((data) => {
        if (data) {
          setItems(data.items);
          setNextCursor(data.nextCursor);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session, fetchItems]);

  async function loadMore() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await fetchItems(nextCursor);
      if (data) {
        setItems((prev) => [...prev, ...data.items]);
        setNextCursor(data.nextCursor);
      }
    } finally {
      setLoadingMore(false);
    }
  }

  const filtered =
    filter === "all" ? items : items.filter((i) => i.type === filter);
  const grouped = groupByDate(filtered);

  if (isPending) {
    return (
      <div className="min-h-screen">
        <div className="h-16 border-b border-medium-gray/30 bg-black/95" />
        <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-16 w-full animate-pulse bg-medium-gray/10"
              />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Activity Log", href: "/activity-log" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Your Activity Log</h1>
          <p className="mt-1 text-sm text-medium-gray">
            A history of everything you have done on the platform
          </p>
        </div>

        {/* Filter buttons */}
        <div className="mb-6 flex flex-wrap gap-2">
          {filterOptions.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`border px-3 py-1.5 text-xs font-semibold uppercase transition-colors ${
                filter === f.value
                  ? "border-code-green bg-code-green text-black"
                  : "border-medium-gray/50 text-medium-gray hover:border-code-green hover:text-code-green"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-16 w-full animate-pulse bg-medium-gray/10"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="border border-medium-gray/20 p-12 text-center">
            <p className="text-sm text-medium-gray">
              {filter === "all"
                ? "No activity yet. Start by joining an endeavor!"
                : "No activity of this type yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(grouped).map(([date, dateItems]) => (
              <div key={date}>
                <h2 className="mb-3 border-b border-medium-gray/20 pb-2 text-xs font-bold uppercase tracking-wider text-medium-gray">
                  {date}
                </h2>
                <div className="space-y-1">
                  {dateItems.map((item, idx) => {
                    const config = typeConfig[item.type] || {
                      color: "text-medium-gray",
                      label: item.type.toUpperCase(),
                      icon: "-",
                    };
                    return (
                      <div
                        key={`${item.type}-${item.endeavorId}-${idx}`}
                        className="group flex items-start gap-3 border-l-2 border-medium-gray/20 py-3 pl-4 transition-colors hover:border-code-green/50"
                      >
                        <span
                          className={`mt-0.5 font-mono text-sm font-bold ${config.color}`}
                        >
                          {config.icon}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold uppercase ${config.color}`}
                            >
                              {config.label}
                            </span>
                            <span
                              className="text-xs text-medium-gray"
                              title={new Date(item.createdAt).toLocaleString()}
                            >
                              {formatTimeAgo(item.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm font-semibold">{item.title}</p>
                          {item.detail && (
                            <p className="text-xs text-medium-gray line-clamp-1">
                              {item.type === "endorsement"
                                ? `Rating: ${item.detail}/5`
                                : item.detail}
                            </p>
                          )}
                          <div className="mt-0.5 text-xs text-medium-gray">
                            <Link
                              href={`/endeavors/${item.endeavorId}`}
                              className="text-code-blue hover:text-code-green"
                            >
                              {item.endeavorTitle}
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load more */}
        {nextCursor && !loading && (
          <div className="mt-8 text-center">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="border border-medium-gray/50 px-6 py-2 text-sm font-semibold text-medium-gray transition-colors hover:border-code-green hover:text-code-green disabled:opacity-50"
            >
              {loadingMore ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
