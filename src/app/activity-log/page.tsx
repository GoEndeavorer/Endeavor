"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { formatTimeAgo } from "@/lib/time";
import { useToast } from "@/components/toast";

type ActivityItem = {
  type: string;
  title: string;
  detail: string | null;
  endeavorId: string;
  endeavorTitle: string;
  createdAt: string;
};

type DateGroup = "Today" | "Yesterday" | "This Week" | "This Month" | "Earlier";

const typeConfig: Record<
  string,
  { color: string; label: string; icon: string; description: string }
> = {
  endeavor_created: {
    color: "text-code-green",
    label: "CREATED",
    icon: "+",
    description: "Created a new endeavor",
  },
  task_completed: {
    color: "text-code-green",
    label: "TASK DONE",
    icon: "^",
    description: "Completed a task",
  },
  discussion: {
    color: "text-code-blue",
    label: "DISCUSSION",
    icon: ">",
    description: "Posted in discussion",
  },
  story: {
    color: "text-purple-400",
    label: "STORY",
    icon: "~",
    description: "Published a story",
  },
  joined: {
    color: "text-yellow-400",
    label: "JOINED",
    icon: "*",
    description: "Joined an endeavor",
  },
  milestone: {
    color: "text-cyan-400",
    label: "MILESTONE",
    icon: "!",
    description: "Milestone update",
  },
  endorsement: {
    color: "text-orange-400",
    label: "ENDORSED",
    icon: "#",
    description: "Wrote an endorsement",
  },
};

const filterOptions = [
  { value: "all", label: "All" },
  { value: "endeavor_created", label: "Created" },
  { value: "task_completed", label: "Tasks" },
  { value: "discussion", label: "Discussions" },
  { value: "story", label: "Stories" },
  { value: "joined", label: "Joined" },
  { value: "milestone", label: "Milestones" },
  { value: "endorsement", label: "Endorsements" },
];

function getDateGroup(dateStr: string): DateGroup {
  const date = new Date(dateStr);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  if (date >= today) return "Today";
  if (date >= yesterday) return "Yesterday";
  if (date >= weekAgo) return "This Week";
  if (date >= monthAgo) return "This Month";
  return "Earlier";
}

const DATE_GROUP_ORDER: DateGroup[] = [
  "Today",
  "Yesterday",
  "This Week",
  "This Month",
  "Earlier",
];

function groupByDate(items: ActivityItem[]): Map<DateGroup, ActivityItem[]> {
  const groups = new Map<DateGroup, ActivityItem[]>();
  for (const item of items) {
    const key = getDateGroup(item.createdAt);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }
  return groups;
}

function getTypeCounts(items: ActivityItem[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    counts[item.type] = (counts[item.type] || 0) + 1;
  }
  return counts;
}

const PAGE_SIZE = 50;

export default function ActivityLogPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { toast } = useToast();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState("all");
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const fetchItems = useCallback(
    async (type: string, currentOffset: number, append: boolean) => {
      const params = new URLSearchParams();
      params.set("limit", String(PAGE_SIZE));
      params.set("offset", String(currentOffset));
      if (type !== "all") params.set("type", type);

      const res = await fetch(`/api/activity-log?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to load activity");
      }
      const data = await res.json();
      const fetched = data.items as ActivityItem[];

      if (append) {
        setItems((prev) => [...prev, ...fetched]);
      } else {
        setItems(fetched);
      }
      setHasMore(data.hasMore ?? false);
      setOffset(currentOffset + fetched.length);
    },
    []
  );

  // Initial load + reload when filter changes
  useEffect(() => {
    if (!session) return;
    setLoading(true);
    setError(null);
    setOffset(0);
    fetchItems(filter, 0, false)
      .catch((err) => {
        setError(err.message);
        toast("Failed to load activity log", "error");
      })
      .finally(() => setLoading(false));
  }, [session, filter, fetchItems, toast]);

  async function loadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      await fetchItems(filter, offset, true);
    } catch {
      toast("Failed to load more activity", "error");
    } finally {
      setLoadingMore(false);
    }
  }

  const grouped = groupByDate(items);
  const typeCounts = getTypeCounts(items);
  const totalLoaded = items.length;

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
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-code-green mb-3">
            {"// activity log"}
          </p>
          <h1 className="text-3xl font-bold">Your Activity Log</h1>
          <p className="mt-1 text-sm text-medium-gray">
            A chronological history of everything you have done on the platform
          </p>
        </div>

        {/* Activity summary strip */}
        {!loading && items.length > 0 && (
          <div className="mb-6 border border-medium-gray/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-code-green mb-3">
              {"// summary"}
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-medium-gray">Total loaded:</span>
                <span className="font-mono text-sm font-bold text-code-green">
                  {totalLoaded}
                </span>
              </div>
              {Object.entries(typeCounts).map(([type, count]) => {
                const config = typeConfig[type];
                if (!config) return null;
                return (
                  <div key={type} className="flex items-center gap-2">
                    <span className={`font-mono text-xs font-bold ${config.color}`}>
                      {config.icon}
                    </span>
                    <span className="text-xs text-medium-gray">
                      {config.label}:
                    </span>
                    <span className={`font-mono text-sm font-bold ${config.color}`}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter buttons */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-code-green mb-3">
            {"// filter by type"}
          </p>
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((f) => {
              const count =
                f.value === "all" ? totalLoaded : typeCounts[f.value] || 0;
              return (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`flex items-center gap-1.5 border px-3 py-1.5 text-xs font-semibold uppercase transition-colors ${
                    filter === f.value
                      ? "border-code-green bg-code-green text-black"
                      : "border-medium-gray/50 text-medium-gray hover:border-code-green hover:text-code-green"
                  }`}
                >
                  {f.label}
                  {!loading && count > 0 && (
                    <span
                      className={`font-mono text-[10px] ${
                        filter === f.value
                          ? "text-black/70"
                          : "text-medium-gray/70"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-6 border border-red-500/30 p-4 text-center">
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchItems(filter, 0, false)
                  .catch((err) => setError(err.message))
                  .finally(() => setLoading(false));
              }}
              className="mt-2 text-xs text-code-green hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex gap-3 py-3">
                <div className="h-4 w-4 animate-pulse bg-medium-gray/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 animate-pulse bg-medium-gray/10" />
                  <div className="h-4 w-3/4 animate-pulse bg-medium-gray/10" />
                  <div className="h-3 w-1/3 animate-pulse bg-medium-gray/10" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="border border-medium-gray/20 p-12 text-center">
            <div className="mb-4 font-mono text-4xl text-medium-gray/30">
              [ ]
            </div>
            <p className="text-sm text-medium-gray">
              {filter === "all"
                ? "No activity yet. Start by joining or creating an endeavor!"
                : `No ${filterOptions.find((f) => f.value === filter)?.label.toLowerCase() || "activity"} yet.`}
            </p>
            {filter !== "all" && (
              <button
                onClick={() => setFilter("all")}
                className="mt-3 text-xs text-code-blue hover:text-code-green"
              >
                Clear filter
              </button>
            )}
          </div>
        ) : (
          /* Activity timeline grouped by date */
          <div className="space-y-8">
            {DATE_GROUP_ORDER.map((dateGroup) => {
              const dateItems = grouped.get(dateGroup);
              if (!dateItems || dateItems.length === 0) return null;
              return (
                <div key={dateGroup}>
                  <div className="mb-3 flex items-center gap-3 border-b border-medium-gray/20 pb-2">
                    <h2 className="text-xs font-bold uppercase tracking-wider text-medium-gray">
                      {dateGroup}
                    </h2>
                    <span className="font-mono text-[10px] text-medium-gray/60">
                      {dateItems.length} {dateItems.length === 1 ? "action" : "actions"}
                    </span>
                  </div>
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-[7px] top-0 bottom-0 w-px bg-medium-gray/15" />

                    <div className="space-y-0.5">
                      {dateItems.map((item, idx) => {
                        const config = typeConfig[item.type] || {
                          color: "text-medium-gray",
                          label: item.type.toUpperCase(),
                          icon: "-",
                          description: item.type,
                        };
                        return (
                          <div
                            key={`${item.type}-${item.endeavorId}-${item.createdAt}-${idx}`}
                            className="group relative flex items-start gap-3 py-3 pl-6 transition-colors hover:bg-medium-gray/5"
                          >
                            {/* Timeline dot */}
                            <div
                              className={`absolute left-[3px] top-[18px] h-[9px] w-[9px] border-2 border-black transition-colors ${config.color.replace("text-", "bg-")} group-hover:scale-125`}
                              style={{ borderRadius: "50%" }}
                            />

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`font-mono text-xs font-bold ${config.color}`}
                                >
                                  {config.icon}
                                </span>
                                <span
                                  className={`text-[10px] font-bold uppercase tracking-wide ${config.color}`}
                                >
                                  {config.label}
                                </span>
                                <span className="text-[10px] text-medium-gray/60">
                                  &middot;
                                </span>
                                <span
                                  className="text-xs text-medium-gray"
                                  title={new Date(item.createdAt).toLocaleString()}
                                >
                                  {formatTimeAgo(item.createdAt)}
                                </span>
                              </div>

                              <p className="mt-0.5 text-sm font-semibold leading-snug">
                                {item.title}
                              </p>

                              {item.detail && (
                                <p className="mt-0.5 text-xs text-medium-gray line-clamp-1">
                                  {item.type === "endorsement"
                                    ? `Rating: ${"*".repeat(Number(item.detail) || 0)}${"_".repeat(5 - (Number(item.detail) || 0))} (${item.detail}/5)`
                                    : item.type === "milestone"
                                      ? `Status: ${item.detail}`
                                      : item.type === "endeavor_created"
                                        ? `Category: ${item.detail}`
                                        : item.type === "joined"
                                          ? `Role: ${item.detail}`
                                          : item.detail}
                                </p>
                              )}

                              <div className="mt-1">
                                <Link
                                  href={`/endeavors/${item.endeavorId}`}
                                  className="inline-flex items-center gap-1 text-xs text-code-blue hover:text-code-green transition-colors"
                                >
                                  <span className="font-mono text-[10px] text-medium-gray/50">
                                    &rarr;
                                  </span>
                                  {item.endeavorTitle}
                                </Link>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load more */}
        {hasMore && !loading && (
          <div className="mt-8 flex flex-col items-center gap-2">
            <button
              onClick={loadMore}
              disabled={loadingMore}
              className="border border-medium-gray/50 px-6 py-2 text-sm font-semibold text-medium-gray transition-colors hover:border-code-green hover:text-code-green disabled:opacity-50"
            >
              {loadingMore ? (
                <span className="flex items-center gap-2">
                  <span className="inline-block h-3 w-3 animate-spin border border-medium-gray border-t-code-green" style={{ borderRadius: "50%" }} />
                  Loading...
                </span>
              ) : (
                "Load More"
              )}
            </button>
            <span className="text-[10px] text-medium-gray/50 font-mono">
              showing {items.length} items
            </span>
          </div>
        )}

        {/* End of log indicator */}
        {!hasMore && !loading && items.length > 0 && (
          <div className="mt-8 text-center">
            <span className="font-mono text-xs text-medium-gray/40">
              {"// end of activity log"}
            </span>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
