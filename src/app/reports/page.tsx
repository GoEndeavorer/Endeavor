"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useSession } from "@/lib/auth-client";

type Overview = {
  total_endeavors: number;
  total_members: number;
  total_tasks: number;
  completed_tasks: number;
  total_discussions: number;
  total_stories: number;
};

type WeeklyGrowth = { week: string; new_members: number };

type TopEndeavor = {
  id: string;
  title: string;
  status: string;
  category: string;
  member_count: number;
  task_count: number;
  discussion_count: number;
};

type TaskBreakdown = { status: string; count: number };

type ReportData = {
  overview: Overview;
  weeklyGrowth: WeeklyGrowth[];
  topEndeavors: TopEndeavor[];
  taskBreakdown: TaskBreakdown[];
};

const statusColors: Record<string, string> = {
  open: "text-code-green",
  "in-progress": "text-code-blue",
  completed: "text-green-400",
  draft: "text-medium-gray",
  todo: "text-yellow-400",
  cancelled: "text-red-400",
};

export default function ReportsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  useEffect(() => {
    if (!session) return;
    fetch("/api/creator-reports")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session]);

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center text-medium-gray">
        <span className="animate-pulse font-mono text-sm">loading...</span>
      </div>
    );
  }

  const taskCompletionRate =
    data && Number(data.overview.total_tasks) > 0
      ? Math.round((Number(data.overview.completed_tasks) / Number(data.overview.total_tasks)) * 100)
      : 0;

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Reports", href: "/reports" }} />
      <main className="mx-auto max-w-5xl px-4 pt-24 pb-16">
        <h1 className="text-xl font-bold mb-2">Creator Reports</h1>
        <p className="text-sm text-medium-gray mb-8">
          Analytics and insights across all your endeavors.
        </p>

        {loading || !data ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border border-medium-gray/20 p-4 animate-pulse">
                  <div className="h-3 w-16 bg-medium-gray/10 mb-2" />
                  <div className="h-8 w-10 bg-medium-gray/10" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* overview stats */}
            <section className="mb-10">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
                {"// overview"}
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <div className="border border-medium-gray/20 p-4">
                  <p className="text-xs text-medium-gray mb-1">Endeavors</p>
                  <p className="text-2xl font-bold">{Number(data.overview.total_endeavors)}</p>
                </div>
                <div className="border border-medium-gray/20 p-4">
                  <p className="text-xs text-medium-gray mb-1">Members</p>
                  <p className="text-2xl font-bold">{Number(data.overview.total_members)}</p>
                </div>
                <div className="border border-medium-gray/20 p-4">
                  <p className="text-xs text-medium-gray mb-1">Tasks</p>
                  <p className="text-2xl font-bold">{Number(data.overview.total_tasks)}</p>
                </div>
                <div className="border border-medium-gray/20 p-4">
                  <p className="text-xs text-medium-gray mb-1">Completion</p>
                  <p className="text-2xl font-bold text-code-green">{taskCompletionRate}%</p>
                </div>
                <div className="border border-medium-gray/20 p-4">
                  <p className="text-xs text-medium-gray mb-1">Discussions</p>
                  <p className="text-2xl font-bold">{Number(data.overview.total_discussions)}</p>
                </div>
                <div className="border border-medium-gray/20 p-4">
                  <p className="text-xs text-medium-gray mb-1">Stories</p>
                  <p className="text-2xl font-bold">{Number(data.overview.total_stories)}</p>
                </div>
              </div>
            </section>

            {/* task breakdown */}
            {data.taskBreakdown.length > 0 && (
              <section className="mb-10">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
                  {"// task breakdown"}
                </h2>
                <div className="border border-medium-gray/20 p-4">
                  <div className="space-y-3">
                    {data.taskBreakdown.map((tb) => {
                      const pct = Number(data.overview.total_tasks) > 0
                        ? Math.round((tb.count / Number(data.overview.total_tasks)) * 100)
                        : 0;
                      return (
                        <div key={tb.status}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs capitalize ${statusColors[tb.status] || "text-medium-gray"}`}>
                              {tb.status}
                            </span>
                            <span className="text-xs font-mono text-medium-gray">
                              {tb.count} ({pct}%)
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-medium-gray/10">
                            <div
                              className={`h-full transition-all duration-500 ${
                                tb.status === "completed" ? "bg-code-green" : "bg-code-blue"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* weekly member growth */}
            {data.weeklyGrowth.length > 0 && (
              <section className="mb-10">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
                  {"// weekly member growth"}
                </h2>
                <div className="border border-medium-gray/20 p-4">
                  <div className="flex items-end gap-2 h-32">
                    {data.weeklyGrowth.map((w) => {
                      const max = Math.max(...data.weeklyGrowth.map((wg) => Number(wg.new_members)), 1);
                      const height = Math.max((Number(w.new_members) / max) * 100, 4);
                      return (
                        <div key={w.week} className="flex-1 flex flex-col items-center gap-1">
                          <span className="text-xs font-mono text-code-green">
                            {Number(w.new_members)}
                          </span>
                          <div
                            className="w-full bg-code-green/40 transition-all duration-500"
                            style={{ height: `${height}%` }}
                          />
                          <span className="text-[10px] text-medium-gray">
                            {new Date(w.week).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}

            {/* top endeavors */}
            {data.topEndeavors.length > 0 && (
              <section className="mb-10">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
                  {"// top endeavors"}
                </h2>
                <div className="space-y-1">
                  {data.topEndeavors.map((e, i) => (
                    <Link
                      key={e.id}
                      href={`/endeavors/${e.id}`}
                      className="flex items-center gap-3 border border-medium-gray/20 p-4 transition-colors hover:border-code-green/30"
                    >
                      <span className="font-mono text-sm font-bold text-code-green shrink-0 w-6">
                        #{i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">{e.title}</p>
                        <p className="text-xs text-medium-gray">
                          {e.category} &middot;{" "}
                          <span className={`capitalize ${statusColors[e.status] || ""}`}>{e.status}</span>
                        </p>
                      </div>
                      <div className="flex gap-4 shrink-0 text-xs text-medium-gray">
                        <span>{Number(e.member_count)} members</span>
                        <span>{Number(e.task_count)} tasks</span>
                        <span>{Number(e.discussion_count)} discussions</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* empty state */}
            {Number(data.overview.total_endeavors) === 0 && (
              <div className="border border-medium-gray/20 p-8 text-center">
                <p className="text-sm text-medium-gray mb-3">
                  You haven&apos;t created any endeavors yet.
                </p>
                <Link
                  href="/endeavors/create"
                  className="text-xs text-code-blue hover:text-code-green transition-colors"
                >
                  Create your first endeavor &rarr;
                </Link>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
