"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { formatTimeAgo } from "@/lib/time";

type TimelineEvent = {
  id: string;
  type: string;
  title: string;
  detail: string | null;
  actorName: string | null;
  actorId: string | null;
  createdAt: string;
};

const typeConfig: Record<string, { icon: string; color: string }> = {
  member_joined: { icon: "+", color: "text-code-green" },
  milestone_completed: { icon: "*", color: "text-code-green" },
  milestone_created: { icon: "o", color: "text-code-blue" },
  task_completed: { icon: ">", color: "text-code-green" },
  task_created: { icon: "-", color: "text-medium-gray" },
  discussion: { icon: "#", color: "text-yellow-400" },
  story_published: { icon: "~", color: "text-purple-400" },
  update_posted: { icon: "!", color: "text-orange-400" },
};

function groupByDate(events: TimelineEvent[]) {
  const groups: { date: string; events: TimelineEvent[] }[] = [];
  for (const event of events) {
    const date = new Date(event.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const existing = groups.find((g) => g.date === date);
    if (existing) {
      existing.events.push(event);
    } else {
      groups.push({ date, events: [event] });
    }
  }
  return groups;
}

export default function TimelinePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch(`/api/endeavors/${id}/timeline`)
      .then((r) => r.json())
      .then(setEvents)
      .finally(() => setLoading(false));

    fetch(`/api/endeavors/${id}`)
      .then((r) => r.json())
      .then((data) => setTitle(data.title || ""))
      .catch(() => {});
  }, [id]);

  const types = [...new Set(events.map((e) => e.type))];
  const filtered = filter === "all" ? events : events.filter((e) => e.type === filter);
  const grouped = groupByDate(filtered);

  return (
    <div className="min-h-screen">
      <AppHeader
        breadcrumb={{
          label: title || "Endeavor",
          href: `/endeavors/${id}`,
        }}
      />

      <main className="mx-auto max-w-2xl px-4 pt-24 pb-16">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl font-bold">Timeline</h1>
          <Link
            href={`/endeavors/${id}/dashboard`}
            className="text-xs text-code-blue hover:text-code-green"
          >
            Dashboard &rarr;
          </Link>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-1.5">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 text-xs transition-colors ${
              filter === "all"
                ? "bg-code-green/10 text-code-green border border-code-green/30"
                : "text-medium-gray border border-medium-gray/20 hover:text-white"
            }`}
          >
            All ({events.length})
          </button>
          {types.map((type) => {
            const config = typeConfig[type] || { icon: "?", color: "text-medium-gray" };
            const count = events.filter((e) => e.type === type).length;
            return (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1 text-xs transition-colors ${
                  filter === type
                    ? `bg-white/5 ${config.color} border border-current/30`
                    : "text-medium-gray border border-medium-gray/20 hover:text-white"
                }`}
              >
                {type.replace(/_/g, " ")} ({count})
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="h-6 w-6 bg-medium-gray/20 shrink-0" />
                <div className="flex-1">
                  <div className="h-4 w-3/4 bg-medium-gray/20 mb-2" />
                  <div className="h-3 w-1/4 bg-medium-gray/10" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="border border-medium-gray/20 p-12 text-center">
            <p className="text-medium-gray text-sm">No timeline events yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {grouped.map((group) => (
              <div key={group.date}>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-medium-gray">
                  {group.date}
                </h2>
                <div className="relative border-l border-medium-gray/20 pl-6 space-y-4">
                  {group.events.map((event) => {
                    const config = typeConfig[event.type] || { icon: "?", color: "text-medium-gray" };
                    return (
                      <div key={event.id} className="relative">
                        <span
                          className={`absolute -left-[25px] flex h-4 w-4 items-center justify-center border border-medium-gray/30 bg-black text-[10px] font-mono font-bold ${config.color}`}
                        >
                          {config.icon}
                        </span>
                        <div>
                          <p className="text-sm text-light-gray">{event.title}</p>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-medium-gray">
                            <span>{formatTimeAgo(new Date(event.createdAt))}</span>
                            {event.actorName && event.actorId && (
                              <>
                                <span>&middot;</span>
                                <Link
                                  href={`/users/${event.actorId}`}
                                  className="text-code-blue hover:text-code-green"
                                >
                                  {event.actorName}
                                </Link>
                              </>
                            )}
                          </div>
                          {event.detail && (
                            <p className="mt-1 text-xs text-medium-gray/70">
                              {event.detail}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
