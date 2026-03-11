"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

type Stats = {
  users: number;
  endeavors: number;
  openEndeavors: number;
  completedEndeavors: number;
  memberships: number;
  stories: number;
  tasks: number;
  tasksDone: number;
  discussions: number;
  newUsersMonth: number;
  newEndeavorsWeek: number;
};

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.ok ? r.json() : null)
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Stats", href: "/stats" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <h1 className="mb-2 text-3xl font-bold">Platform Stats</h1>
        <p className="mb-8 text-sm text-medium-gray">
          A live snapshot of the Endeavor community.
        </p>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-24 animate-pulse bg-medium-gray/10 border border-medium-gray/10" />
            ))}
          </div>
        ) : !stats ? (
          <p className="text-sm text-medium-gray">Failed to load stats.</p>
        ) : (
          <>
            {/* Primary metrics */}
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              <StatCard value={stats.users} label="Total Users" color="text-code-green" />
              <StatCard value={stats.endeavors} label="Total Endeavors" color="text-code-blue" />
              <StatCard value={stats.memberships} label="Memberships" color="text-purple-400" />
            </div>

            {/* Endeavor breakdown */}
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// endeavors"}
            </h2>
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              <StatCard value={stats.openEndeavors} label="Open" color="text-code-green" />
              <StatCard
                value={stats.endeavors - stats.openEndeavors - stats.completedEndeavors}
                label="In Progress"
                color="text-code-blue"
              />
              <StatCard value={stats.completedEndeavors} label="Completed" color="text-purple-400" />
            </div>

            {/* Activity metrics */}
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// activity"}
            </h2>
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              <StatCard value={stats.discussions} label="Messages" color="text-code-blue" />
              <StatCard value={stats.tasksDone} label="Tasks Completed" color="text-yellow-400" sub={`of ${stats.tasks} total`} />
              <StatCard value={stats.stories} label="Stories Published" color="text-purple-400" />
            </div>

            {/* Growth */}
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// growth"}
            </h2>
            <div className="mb-8 grid gap-4 sm:grid-cols-2">
              <div className="border border-medium-gray/20 p-5">
                <p className="text-3xl font-bold text-code-green">+{stats.newUsersMonth}</p>
                <p className="text-xs text-medium-gray mt-1">new users this month</p>
              </div>
              <div className="border border-medium-gray/20 p-5">
                <p className="text-3xl font-bold text-code-blue">+{stats.newEndeavorsWeek}</p>
                <p className="text-xs text-medium-gray mt-1">new endeavors this week</p>
              </div>
            </div>

            {/* Health indicator */}
            <div className="border border-code-green/30 bg-code-green/5 p-6 text-center">
              <p className="text-sm text-code-green font-semibold mb-1">Platform Health</p>
              <p className="text-xs text-medium-gray">
                {stats.tasksDone > 0 ? `${Math.round((stats.tasksDone / stats.tasks) * 100)}% task completion rate` : "No tasks tracked yet"}
                {stats.memberships > 0 && ` · ${(stats.memberships / stats.endeavors).toFixed(1)} avg members per endeavor`}
              </p>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <Link href="/leaderboard" className="text-xs text-medium-gray hover:text-code-green transition-colors">
                View Leaderboard &rarr;
              </Link>
              <Link href="/activity" className="text-xs text-medium-gray hover:text-code-green transition-colors">
                View Activity Feed &rarr;
              </Link>
              <Link href="/explore" className="text-xs text-medium-gray hover:text-code-green transition-colors">
                View Trending &rarr;
              </Link>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function StatCard({ value, label, color, sub }: { value: number; label: string; color: string; sub?: string }) {
  return (
    <div className="border border-medium-gray/20 p-5 text-center">
      <p className={`text-3xl font-bold ${color}`}>{value.toLocaleString()}</p>
      <p className="text-xs text-medium-gray mt-1">{label}</p>
      {sub && <p className="text-[10px] text-medium-gray/60 mt-0.5">{sub}</p>}
    </div>
  );
}
