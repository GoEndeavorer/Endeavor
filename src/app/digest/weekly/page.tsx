"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

type WeeklyDigestData = {
  weekStart: string;
  weekEnd: string;
  userName: string;
  stats: {
    endeavorsJoined: number;
    endeavorsCreated: number;
    tasksCompleted: number;
    discussionsPosted: number;
    milestonesHit: number;
    newFollowers: number;
  };
  joinedEndeavors: {
    id: string;
    title: string;
    category: string;
    imageUrl: string | null;
    joinedAt: string;
  }[];
  createdEndeavors: {
    id: string;
    title: string;
    category: string;
    imageUrl: string | null;
    createdAt: string;
  }[];
  completedTasks: {
    id: string;
    title: string;
    endeavorId: string;
    endeavorTitle: string;
    updatedAt: string;
  }[];
  milestonesHit: {
    id: string;
    title: string;
    endeavorId: string;
    endeavorTitle: string;
    completedAt: string;
  }[];
  newFollowers: {
    id: string;
    followerId: string;
    followerName: string;
    followerImage: string | null;
    createdAt: string;
  }[];
  topEndeavor: {
    id: string;
    title: string;
    category: string;
    imageUrl: string | null;
    count: number;
  } | null;
  upcomingTasks: {
    id: string;
    title: string;
    status: string;
    dueDate: string;
    priority: string;
    endeavorId: string;
    endeavorTitle: string;
  }[];
  recentEndorsements: {
    id: string;
    content: string;
    rating: number;
    authorName: string;
    authorImage: string | null;
    endeavorId: string;
    endeavorTitle: string;
    createdAt: string;
  }[];
};

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${s.toLocaleDateString("en-US", opts)} - ${e.toLocaleDateString("en-US", { ...opts, year: "numeric" })}`;
}

function formatDueDate(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "tomorrow";
  return `in ${diffDays}d`;
}

function priorityColor(priority: string): string {
  switch (priority) {
    case "urgent":
      return "text-red-400";
    case "high":
      return "text-orange-400";
    case "medium":
      return "text-code-blue";
    default:
      return "text-medium-gray";
  }
}

export default function WeeklyDigestPage() {
  const [data, setData] = useState<WeeklyDigestData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/digest/weekly")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const totalActivity =
    data
      ? data.stats.endeavorsJoined +
        data.stats.endeavorsCreated +
        data.stats.tasksCompleted +
        data.stats.discussionsPosted +
        data.stats.milestonesHit +
        data.stats.newFollowers
      : 0;

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Weekly Digest", href: "/digest/weekly" }} />

      <main className="mx-auto max-w-2xl px-4 pt-24 pb-16">
        {loading ? (
          <div className="space-y-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse border border-medium-gray/20 p-6">
                <div className="mb-4 h-3 w-40 bg-medium-gray/10" />
                <div className="space-y-3">
                  <div className="h-3 w-full bg-medium-gray/10" />
                  <div className="h-3 w-3/4 bg-medium-gray/10" />
                </div>
              </div>
            ))}
          </div>
        ) : !data ? (
          <div className="border border-medium-gray/20 py-20 text-center">
            <p className="font-mono text-sm text-medium-gray">
              Could not load your weekly digest. Are you signed in?
            </p>
            <Link
              href="/login"
              className="mt-3 inline-block font-mono text-sm text-code-green hover:underline"
            >
              Sign in &rarr;
            </Link>
          </div>
        ) : (
          <div className="space-y-0">
            {/* ── Email-style envelope ─────────────────────────────── */}
            <div className="border border-medium-gray/20">
              {/* Header bar */}
              <div className="border-b border-medium-gray/20 bg-medium-gray/5 px-6 py-3">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-xs text-medium-gray">
                    WEEKLY_DIGEST.log
                  </p>
                  <p className="font-mono text-xs text-medium-gray">
                    {formatDateRange(data.weekStart, data.weekEnd)}
                  </p>
                </div>
              </div>

              {/* ── Greeting ───────────────────────────────────────── */}
              <div className="border-b border-medium-gray/10 px-6 py-6">
                <p className="font-mono text-sm text-light-gray">
                  <span className="text-code-green">$</span> Hey{" "}
                  <span className="text-code-blue">{data.userName}</span>,
                  here&apos;s your week in review.
                </p>
                {totalActivity === 0 && (
                  <p className="mt-2 font-mono text-xs text-medium-gray">
                    // quiet week -- nothing logged. check back soon.
                  </p>
                )}
              </div>

              {/* ── Stats Summary ──────────────────────────────────── */}
              {totalActivity > 0 && (
                <div className="border-b border-medium-gray/10 px-6 py-6">
                  <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-widest text-code-green">
                    {"// stats"}
                  </p>
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                    {[
                      { label: "Joined", value: data.stats.endeavorsJoined, color: "text-code-green" },
                      { label: "Created", value: data.stats.endeavorsCreated, color: "text-code-green" },
                      { label: "Tasks", value: data.stats.tasksCompleted, color: "text-code-blue" },
                      { label: "Posts", value: data.stats.discussionsPosted, color: "text-code-blue" },
                      { label: "Milestones", value: data.stats.milestonesHit, color: "text-code-green" },
                      { label: "Followers", value: data.stats.newFollowers, color: "text-light-gray" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="border border-medium-gray/15 p-3 text-center"
                      >
                        <p className={`font-mono text-xl font-bold ${stat.color}`}>
                          {stat.value}
                        </p>
                        <p className="mt-0.5 font-mono text-[10px] uppercase text-medium-gray">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Top Endeavor Highlight ─────────────────────────── */}
              {data.topEndeavor && (
                <div className="border-b border-medium-gray/10 px-6 py-6">
                  <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-widest text-code-green">
                    {"// top performing endeavor"}
                  </p>
                  <Link
                    href={`/endeavors/${data.topEndeavor.id}`}
                    className="flex items-center gap-4 border border-code-green/30 bg-code-green/5 p-4 transition-colors hover:border-code-green/60"
                  >
                    {data.topEndeavor.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={data.topEndeavor.imageUrl}
                        alt=""
                        className="h-12 w-16 flex-shrink-0 object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-16 flex-shrink-0 items-center justify-center bg-code-green/10 font-mono text-lg font-bold text-code-green">
                        {data.topEndeavor.title.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-sm font-semibold text-light-gray">
                        {data.topEndeavor.title}
                      </p>
                      <p className="font-mono text-xs text-medium-gray">
                        {data.topEndeavor.category}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="font-mono text-lg font-bold text-code-green">
                        {data.topEndeavor.count}
                      </p>
                      <p className="font-mono text-[10px] text-medium-gray">actions</p>
                    </div>
                  </Link>
                </div>
              )}

              {/* ── Upcoming Tasks ─────────────────────────────────── */}
              {data.upcomingTasks.length > 0 && (
                <div className="border-b border-medium-gray/10 px-6 py-6">
                  <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-widest text-code-blue">
                    {"// upcoming tasks"}
                  </p>
                  <div className="space-y-2">
                    {data.upcomingTasks.map((t) => (
                      <Link
                        key={t.id}
                        href={`/endeavors/${t.endeavorId}?tab=tasks`}
                        className="flex items-center gap-3 border border-medium-gray/15 p-3 font-mono transition-colors hover:border-code-blue/40"
                      >
                        <span
                          className={`flex-shrink-0 text-[10px] uppercase ${priorityColor(t.priority)}`}
                        >
                          [{t.priority}]
                        </span>
                        <span className="min-w-0 flex-1 truncate text-xs text-light-gray">
                          {t.title}
                        </span>
                        <span className="flex-shrink-0 text-[10px] text-medium-gray">
                          {t.endeavorTitle}
                        </span>
                        <span className="flex-shrink-0 text-[10px] text-code-blue">
                          {formatDueDate(t.dueDate)}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Recent Endorsements ────────────────────────────── */}
              {data.recentEndorsements.length > 0 && (
                <div className="border-b border-medium-gray/10 px-6 py-6">
                  <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-widest text-code-green">
                    {"// recent endorsements"}
                  </p>
                  <div className="space-y-3">
                    {data.recentEndorsements.map((e) => (
                      <div
                        key={e.id}
                        className="border border-medium-gray/15 p-4"
                      >
                        <div className="mb-2 flex items-center gap-2">
                          {e.authorImage ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={e.authorImage}
                              alt=""
                              className="h-5 w-5 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-code-green/10 font-mono text-[10px] font-bold text-code-green">
                              {e.authorName.charAt(0)}
                            </div>
                          )}
                          <span className="font-mono text-xs text-code-blue">
                            {e.authorName}
                          </span>
                          <span className="font-mono text-[10px] text-medium-gray">
                            on {e.endeavorTitle}
                          </span>
                          <span className="ml-auto font-mono text-[10px] text-code-green">
                            {"*".repeat(e.rating)}
                            <span className="text-medium-gray/30">
                              {"*".repeat(5 - e.rating)}
                            </span>
                          </span>
                        </div>
                        <p className="font-mono text-xs leading-relaxed text-light-gray">
                          &quot;{e.content}&quot;
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Milestones Hit ─────────────────────────────────── */}
              {data.milestonesHit.length > 0 && (
                <div className="border-b border-medium-gray/10 px-6 py-6">
                  <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-widest text-code-green">
                    {"// milestones reached"}
                  </p>
                  <div className="space-y-2">
                    {data.milestonesHit.map((m) => (
                      <Link
                        key={m.id}
                        href={`/endeavors/${m.endeavorId}`}
                        className="flex items-center gap-3 border border-medium-gray/15 p-3 font-mono transition-colors hover:border-code-green/40"
                      >
                        <span className="flex-shrink-0 text-code-green">[done]</span>
                        <span className="min-w-0 flex-1 truncate text-xs text-light-gray">
                          {m.title}
                        </span>
                        <span className="flex-shrink-0 text-[10px] text-medium-gray">
                          {m.endeavorTitle}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* ── New Followers ──────────────────────────────────── */}
              {data.newFollowers.length > 0 && (
                <div className="border-b border-medium-gray/10 px-6 py-6">
                  <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-widest text-code-blue">
                    {"// new followers"}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {data.newFollowers.map((f) => (
                      <Link
                        key={f.id}
                        href={`/users/${f.followerId}`}
                        className="flex items-center gap-2 border border-medium-gray/15 px-3 py-2 font-mono transition-colors hover:border-code-blue/40"
                      >
                        {f.followerImage ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={f.followerImage}
                            alt=""
                            className="h-5 w-5 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-code-blue/10 font-mono text-[10px] font-bold text-code-blue">
                            {f.followerName.charAt(0)}
                          </div>
                        )}
                        <span className="text-xs text-light-gray">
                          {f.followerName}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Footer ─────────────────────────────────────────── */}
              <div className="px-6 py-5">
                <p className="font-mono text-xs text-medium-gray">
                  <span className="text-code-green">$</span> end of digest.{" "}
                  <Link
                    href="/dashboard"
                    className="text-code-blue hover:underline"
                  >
                    open dashboard
                  </Link>{" "}
                  |{" "}
                  <Link
                    href="/digest"
                    className="text-code-blue hover:underline"
                  >
                    platform digest
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
