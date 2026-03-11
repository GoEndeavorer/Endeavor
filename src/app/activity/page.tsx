"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { formatTimeAgo } from "@/lib/time";

type ActivityItem = {
  type: "endeavor" | "milestone" | "story" | "update" | "join";
  id: string;
  title: string;
  detail: string | null;
  endeavorId: string | null;
  endeavorTitle: string | null;
  actorName: string;
  imageUrl: string | null;
  createdAt: string;
};

const typeConfig: Record<
  string,
  { color: string; label: string; icon: string }
> = {
  endeavor: { color: "text-code-green", label: "NEW", icon: "+" },
  milestone: { color: "text-yellow-400", label: "MILESTONE", icon: "★" },
  story: { color: "text-purple-400", label: "STORY", icon: "◆" },
  update: { color: "text-code-blue", label: "UPDATE", icon: "→" },
  join: { color: "text-medium-gray", label: "JOINED", icon: "•" },
};

const filterOptions = [
  { value: "all", label: "All" },
  { value: "endeavor", label: "New Endeavors" },
  { value: "milestone", label: "Milestones" },
  { value: "story", label: "Stories" },
  { value: "update", label: "Updates" },
];

export default function ActivityPage() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/activity")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "all" ? items : items.filter((i) => i.type === filter);

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Activity", href: "/activity" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Platform Activity</h1>
            <p className="mt-1 text-sm text-medium-gray">
              Recent happenings across all endeavors
            </p>
          </div>
          <Link
            href="/feed"
            className="text-sm text-medium-gray hover:text-code-green"
          >
            Explore Endeavors
          </Link>
        </div>

        {/* Filters */}
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
              No activity to show yet.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map((item, idx) => {
              const config = typeConfig[item.type] || typeConfig.join;
              return (
                <div
                  key={`${item.type}-${item.id}-${idx}`}
                  className="group flex items-start gap-3 border-l-2 border-medium-gray/20 py-3 pl-4 transition-colors hover:border-code-green/50"
                >
                  <span
                    className={`mt-0.5 text-sm font-bold ${config.color}`}
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
                        {item.detail}
                      </p>
                    )}
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-medium-gray">
                      {item.actorName && <span>{item.actorName}</span>}
                      {item.endeavorTitle && item.type !== "endeavor" && (
                        <>
                          {item.actorName && <span>&middot;</span>}
                          <Link
                            href={`/endeavors/${item.endeavorId}`}
                            className="text-code-blue hover:text-code-green"
                          >
                            {item.endeavorTitle}
                          </Link>
                        </>
                      )}
                      {item.type === "endeavor" && item.endeavorId && (
                        <Link
                          href={`/endeavors/${item.endeavorId}`}
                          className="text-code-blue hover:text-code-green"
                        >
                          View &rarr;
                        </Link>
                      )}
                    </div>
                  </div>
                  {item.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="h-12 w-16 flex-shrink-0 object-cover"
                      loading="lazy"
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
