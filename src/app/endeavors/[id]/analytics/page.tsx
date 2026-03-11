"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

type Analytics = {
  memberGrowth: { date: string; count: number }[];
  discussionActivity: { date: string; count: number }[];
  taskStats: { status: string; count: number }[];
  topContributors: { id: string; name: string; image: string | null; discussions: number; tasks_done: number }[];
  milestoneStats: { completed: number; total: number };
  inviteStats: { total_invite_views: number; active_links: number };
};

export default function AnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  useEffect(() => {
    fetch(`/api/endeavors/${id}`)
      .then((r) => r.json())
      .then((data) => setTitle(data.title || ""))
      .catch(() => {});

    fetch(`/api/endeavors/${id}/analytics`)
      .then((r) => {
        if (!r.ok) throw new Error("Forbidden");
        return r.json();
      })
      .then(setAnalytics)
      .catch(() => setLoading(false))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Analytics", href: `/endeavors/${id}/analytics` }} />
        <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse bg-medium-gray/10" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Analytics", href: `/endeavors/${id}/analytics` }} />
        <main className="mx-auto max-w-4xl px-4 pt-24 pb-16 text-center">
          <p className="text-medium-gray">Only the creator can view analytics.</p>
          <Link href={`/endeavors/${id}/dashboard`} className="mt-4 inline-block text-sm text-code-green hover:underline">
            Back to Dashboard
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const totalTasks = analytics.taskStats.reduce((sum, t) => sum + Number(t.count), 0);
  const doneTasks = Number(analytics.taskStats.find((t) => t.status === "done")?.count || 0);
  const taskCompletionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;
  const milestoneRate = Number(analytics.milestoneStats.total) > 0
    ? Math.round((Number(analytics.milestoneStats.completed) / Number(analytics.milestoneStats.total)) * 100)
    : 0;

  // Build a mini bar chart for discussion activity
  const maxDiscussions = Math.max(...analytics.discussionActivity.map((d) => Number(d.count)), 1);

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: title || "Analytics", href: `/endeavors/${id}/analytics` }} />

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Analytics</h1>
            <p className="text-sm text-medium-gray">{title}</p>
          </div>
          <Link
            href={`/endeavors/${id}/dashboard`}
            className="text-sm text-medium-gray hover:text-code-green"
          >
            &larr; Dashboard
          </Link>
        </div>

        {/* Overview cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <div className="border border-medium-gray/20 p-4">
            <p className="text-2xl font-bold text-code-green">{taskCompletionRate}%</p>
            <p className="text-xs text-medium-gray">Task Completion</p>
            <p className="mt-1 text-xs text-medium-gray">{doneTasks} / {totalTasks} tasks</p>
          </div>
          <div className="border border-medium-gray/20 p-4">
            <p className="text-2xl font-bold text-code-blue">{milestoneRate}%</p>
            <p className="text-xs text-medium-gray">Milestone Progress</p>
            <p className="mt-1 text-xs text-medium-gray">{Number(analytics.milestoneStats.completed)} / {Number(analytics.milestoneStats.total)}</p>
          </div>
          <div className="border border-medium-gray/20 p-4">
            <p className="text-2xl font-bold text-purple-400">{analytics.discussionActivity.reduce((s, d) => s + Number(d.count), 0)}</p>
            <p className="text-xs text-medium-gray">Discussions (30d)</p>
          </div>
          <div className="border border-medium-gray/20 p-4">
            <p className="text-2xl font-bold text-yellow-400">{Number(analytics.inviteStats.total_invite_views)}</p>
            <p className="text-xs text-medium-gray">Invite Link Views</p>
            <p className="mt-1 text-xs text-medium-gray">{Number(analytics.inviteStats.active_links)} active links</p>
          </div>
        </div>

        {/* Discussion activity chart */}
        <section className="mb-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// discussion activity (30 days)"}
          </h2>
          {analytics.discussionActivity.length > 0 ? (
            <div className="flex items-end gap-1 h-24">
              {analytics.discussionActivity.map((d) => (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1" title={`${d.date}: ${d.count}`}>
                  <div
                    className="w-full bg-code-green/60 min-h-[2px] transition-all"
                    style={{ height: `${(Number(d.count) / maxDiscussions) * 100}%` }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-medium-gray">No discussion activity in the last 30 days.</p>
          )}
        </section>

        {/* Member growth */}
        <section className="mb-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-blue">
            {"// member growth (30 days)"}
          </h2>
          {analytics.memberGrowth.length > 0 ? (
            <div className="space-y-1">
              {analytics.memberGrowth.map((d) => (
                <div key={d.date} className="flex items-center gap-3">
                  <span className="w-24 text-xs text-medium-gray font-mono">{d.date}</span>
                  <div className="flex-1 h-4 bg-medium-gray/10">
                    <div
                      className="h-4 bg-code-blue/40"
                      style={{ width: `${Math.min(100, Number(d.count) * 20)}%` }}
                    />
                  </div>
                  <span className="text-xs text-code-blue w-8 text-right">+{d.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-medium-gray">No new members in the last 30 days.</p>
          )}
        </section>

        {/* Task breakdown */}
        <section className="mb-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-yellow-400">
            {"// task breakdown"}
          </h2>
          <div className="flex gap-2">
            {analytics.taskStats.map((t) => {
              const colors: Record<string, string> = {
                todo: "bg-medium-gray/40",
                "in-progress": "bg-code-blue/40",
                done: "bg-code-green/40",
              };
              const width = totalTasks > 0 ? (Number(t.count) / totalTasks) * 100 : 0;
              return (
                <div key={t.status} className="text-center" style={{ flex: width || 1 }}>
                  <div className={`h-8 ${colors[t.status] || "bg-medium-gray/20"}`} />
                  <p className="mt-1 text-xs text-medium-gray capitalize">{t.status}</p>
                  <p className="text-xs font-semibold">{t.count}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Top contributors */}
        <section className="mb-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-purple-400">
            {"// top contributors"}
          </h2>
          <div className="space-y-2">
            {analytics.topContributors.map((c, i) => (
              <Link
                key={c.id}
                href={`/users/${c.id}`}
                className="flex items-center gap-3 border border-medium-gray/10 p-3 transition-colors hover:border-purple-400/30"
              >
                <span className="text-xs font-mono text-medium-gray/50 w-6 text-right">{i + 1}</span>
                <div className="flex h-8 w-8 items-center justify-center bg-purple-400/10 text-xs font-bold text-purple-400 shrink-0">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{c.name}</p>
                </div>
                <div className="flex gap-4 text-xs text-medium-gray">
                  <span>{Number(c.discussions)} posts</span>
                  <span>{Number(c.tasks_done)} tasks</span>
                </div>
              </Link>
            ))}
            {analytics.topContributors.length === 0 && (
              <p className="text-sm text-medium-gray">No contributor data yet.</p>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
