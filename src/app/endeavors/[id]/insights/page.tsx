"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

type Insights = {
  members: { total: number; pending: number; newThisWeek: number };
  tasks: { total: number; completed: number; completionRate: number };
  discussions: { total: number; thisWeek: number };
  milestones: { total: number; completed: number };
  revenue: { total: number; transactions: number };
  stories: number;
  memberGrowth: { week: string; count: number }[];
  topContributors: { id: string; name: string; messages: number; tasks_done: number }[];
  avgTaskCompletionDays: number;
  mostActiveDayOfWeek: string | null;
  memberRetentionRate: number;
  daysSinceCreation: number;
};

export default function InsightsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [data, setData] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/endeavors/${id}/insights`)
      .then(async (r) => {
        if (r.ok) setData(await r.json());
        else setError("Only the creator can view insights");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <>
        <AppHeader />
        <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse border border-medium-gray/20 p-6">
                <div className="mb-2 h-3 w-16 bg-medium-gray/10" />
                <div className="h-8 w-20 bg-medium-gray/10" />
              </div>
            ))}
          </div>
        </main>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <AppHeader />
        <main className="mx-auto max-w-4xl px-4 pt-24 pb-16 text-center">
          <p className="text-medium-gray">{error || "Failed to load insights"}</p>
          <Link href={`/endeavors/${id}`} className="mt-4 inline-block text-sm text-code-green hover:underline">
            Back to endeavor
          </Link>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader breadcrumb={{ label: "Insights", href: `/endeavors/${id}/insights` }} />
      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Insights</h1>
          <Link href={`/endeavors/${id}/dashboard`} className="text-xs text-code-blue hover:text-code-green">
            &larr; Dashboard
          </Link>
        </div>

        {/* Key metrics */}
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Members" value={data.members.total} sub={`${data.members.newThisWeek} new this week`} />
          <MetricCard label="Task Completion" value={`${data.tasks.completionRate}%`} sub={`${data.tasks.completed}/${data.tasks.total} tasks`} />
          <MetricCard label="Discussions" value={data.discussions.total} sub={`${data.discussions.thisWeek} this week`} />
          <MetricCard label="Revenue" value={`$${data.revenue.total.toFixed(2)}`} sub={`${data.revenue.transactions} transactions`} />
        </div>

        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="Milestones" value={`${data.milestones.completed}/${data.milestones.total}`} sub="completed" color="text-purple-400" />
          <MetricCard label="Avg Task Time" value={`${data.avgTaskCompletionDays}d`} sub="to complete" color="text-yellow-400" />
          <MetricCard label="Most Active Day" value={data.mostActiveDayOfWeek || "—"} sub="by discussions" color="text-code-blue" />
          <MetricCard label="Retention" value={`${data.memberRetentionRate}%`} sub={`${data.daysSinceCreation}d old`} color="text-code-green" />
        </div>

        {/* Pending members alert */}
        {data.members.pending > 0 && (
          <div className="mb-8 border border-yellow-400/30 bg-yellow-400/5 p-4">
            <p className="text-sm text-yellow-400">
              {data.members.pending} pending join {data.members.pending === 1 ? "request" : "requests"} —{" "}
              <Link href={`/endeavors/${id}/dashboard`} className="underline hover:text-white">
                Review in dashboard
              </Link>
            </p>
          </div>
        )}

        {/* Member growth chart (text-based) */}
        {data.memberGrowth.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// member growth (last 30 days)"}
            </h2>
            <div className="border border-medium-gray/20 p-4">
              {data.memberGrowth.map((w) => {
                const maxCount = Math.max(...data.memberGrowth.map((g) => g.count));
                const pct = maxCount > 0 ? (w.count / maxCount) * 100 : 0;
                return (
                  <div key={w.week} className="mb-2 flex items-center gap-3">
                    <span className="w-20 shrink-0 text-xs text-medium-gray">
                      {new Date(w.week).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    <div className="flex-1">
                      <div
                        className="h-4 bg-code-green/30"
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-xs font-semibold">{w.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Top contributors */}
        {data.topContributors.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// top contributors"}
            </h2>
            <div className="border border-medium-gray/20">
              <div className="grid grid-cols-4 border-b border-medium-gray/20 px-4 py-2 text-xs text-medium-gray">
                <span>Name</span>
                <span className="text-center">Messages</span>
                <span className="text-center">Tasks Done</span>
                <span className="text-center">Score</span>
              </div>
              {data.topContributors.map((c) => (
                <Link
                  key={c.id}
                  href={`/users/${c.id}`}
                  className="grid grid-cols-4 items-center px-4 py-3 text-sm transition-colors hover:bg-medium-gray/5"
                >
                  <span className="font-semibold truncate">{c.name}</span>
                  <span className="text-center text-code-blue">{c.messages}</span>
                  <span className="text-center text-purple-400">{c.tasks_done}</span>
                  <span className="text-center text-code-green font-bold">
                    {c.messages + c.tasks_done * 3}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Stories count */}
        {data.stories > 0 && (
          <div className="text-center text-sm text-medium-gray">
            {data.stories} published {data.stories === 1 ? "story" : "stories"} —{" "}
            <Link href={`/endeavors/${id}/stories`} className="text-code-blue hover:underline">
              View all
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

function MetricCard({
  label,
  value,
  sub,
  color = "text-code-green",
}: {
  label: string;
  value: string | number;
  sub: string;
  color?: string;
}) {
  return (
    <div className="border border-medium-gray/20 p-4">
      <p className="text-xs text-medium-gray uppercase">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
      <p className="mt-0.5 text-xs text-medium-gray">{sub}</p>
    </div>
  );
}
