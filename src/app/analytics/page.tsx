"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

type DailyRow = {
  day: string;
  endeavors: number;
  users: number;
  discussions: number;
  tasks: number;
  stories: number;
};

type CategoryRow = {
  category: string;
  count: number;
};

type OverviewData = {
  totals: {
    users: number;
    endeavors: number;
    discussions: number;
    tasks: number;
    stories: number;
    activeEndeavors: number;
  };
  growth: {
    newUsersWeek: number;
    newEndeavorsWeek: number;
  };
  topCategories: CategoryRow[];
  daily: DailyRow[];
};

export default function AnalyticsPage() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/overview")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Analytics", href: "/analytics" }} />

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <h1 className="mb-1 font-mono text-3xl font-bold">Platform Analytics</h1>
        <p className="mb-10 font-mono text-sm text-medium-gray">
          Aggregated metrics across the entire Endeavor platform.
        </p>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse border border-medium-gray/10 bg-medium-gray/10"
              />
            ))}
          </div>
        ) : !data ? (
          <p className="font-mono text-sm text-medium-gray">Failed to load analytics data.</p>
        ) : (
          <>
            {/* ── Totals ─────────────────────────────────── */}
            <SectionLabel text="// totals" />
            <div className="mb-10 grid gap-4 sm:grid-cols-3">
              <StatCard value={data.totals.users} label="Users" color="text-code-green" />
              <StatCard value={data.totals.endeavors} label="Endeavors" color="text-code-blue" />
              <StatCard
                value={data.totals.activeEndeavors}
                label="Active Endeavors"
                color="text-code-green"
                sub="open + in-progress"
              />
              <StatCard value={data.totals.discussions} label="Discussions" color="text-code-blue" />
              <StatCard value={data.totals.tasks} label="Tasks" color="text-code-green" />
              <StatCard value={data.totals.stories} label="Stories" color="text-code-blue" />
            </div>

            {/* ── Growth ─────────────────────────────────── */}
            <SectionLabel text="// growth this week" />
            <div className="mb-10 grid gap-4 sm:grid-cols-2">
              <GrowthCard
                delta={data.growth.newUsersWeek}
                total={data.totals.users}
                label="new users"
                color="text-code-green"
              />
              <GrowthCard
                delta={data.growth.newEndeavorsWeek}
                total={data.totals.endeavors}
                label="new endeavors"
                color="text-code-blue"
              />
            </div>

            {/* ── Daily Activity Chart ───────────────────── */}
            <SectionLabel text="// daily activity (30 days)" />
            <DailyChart rows={data.daily} />

            {/* ── Top Categories ─────────────────────────── */}
            <SectionLabel text="// top categories" />
            <CategoryBreakdown categories={data.topCategories} />

            {/* ── Links ──────────────────────────────────── */}
            <div className="mt-10 flex flex-wrap gap-6 justify-center">
              <NavLink href="/stats" label="Detailed Stats" />
              <NavLink href="/leaderboard" label="Leaderboard" />
              <NavLink href="/activity" label="Activity Feed" />
              <NavLink href="/explore" label="Explore" />
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

/* ── Sub-components ────────────────────────────────────────────────────────── */

function SectionLabel({ text }: { text: string }) {
  return (
    <h2 className="mb-4 font-mono text-xs font-semibold uppercase tracking-widest text-code-green">
      {text}
    </h2>
  );
}

function StatCard({
  value,
  label,
  color,
  sub,
}: {
  value: number;
  label: string;
  color: string;
  sub?: string;
}) {
  return (
    <div className="border border-medium-gray/20 p-5 text-center">
      <p className={`font-mono text-3xl font-bold ${color}`}>{value.toLocaleString()}</p>
      <p className="mt-1 font-mono text-xs text-medium-gray">{label}</p>
      {sub && <p className="mt-0.5 font-mono text-[10px] text-medium-gray/60">{sub}</p>}
    </div>
  );
}

function GrowthCard({
  delta,
  total,
  label,
  color,
}: {
  delta: number;
  total: number;
  label: string;
  color: string;
}) {
  const pct = total > 0 ? ((delta / total) * 100).toFixed(1) : "0.0";
  return (
    <div className="border border-medium-gray/20 p-5">
      <p className={`font-mono text-3xl font-bold ${color}`}>+{delta.toLocaleString()}</p>
      <p className="mt-1 font-mono text-xs text-medium-gray">{label}</p>
      <p className="mt-0.5 font-mono text-[10px] text-medium-gray/60">
        {pct}% of {total.toLocaleString()} total
      </p>
    </div>
  );
}

function DailyChart({ rows }: { rows: DailyRow[] }) {
  if (rows.length === 0) {
    return <p className="mb-10 font-mono text-xs text-medium-gray">No daily data available.</p>;
  }

  const totals = rows.map(
    (r) => r.endeavors + r.users + r.discussions + r.tasks + r.stories
  );
  const max = Math.max(...totals, 1);

  return (
    <div className="mb-10 overflow-x-auto">
      <div className="flex items-end gap-[2px]" style={{ minWidth: rows.length * 14 }}>
        {rows.map((row, i) => {
          const total = totals[i];
          const heightPct = (total / max) * 100;
          const dayLabel = row.day.slice(5); // MM-DD
          return (
            <div key={row.day} className="group relative flex flex-col items-center" style={{ flex: 1 }}>
              {/* Tooltip */}
              <div className="pointer-events-none absolute bottom-full mb-1 hidden whitespace-nowrap border border-medium-gray/30 bg-black px-2 py-1 font-mono text-[10px] text-medium-gray group-hover:block">
                <span className="text-code-green">{row.day}</span>
                <br />
                {total} total &mdash; {row.endeavors}e {row.users}u {row.discussions}d {row.tasks}t {row.stories}s
              </div>
              {/* Bar */}
              <div
                className="w-full bg-code-green/70 transition-all hover:bg-code-green"
                style={{
                  height: `${Math.max(heightPct, 2)}px`,
                  maxHeight: 120,
                  minHeight: 2,
                }}
              />
              {/* X-axis label every 5 days */}
              {i % 5 === 0 && (
                <span className="mt-1 font-mono text-[9px] text-medium-gray/60">{dayLabel}</span>
              )}
            </div>
          );
        })}
      </div>
      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-4 font-mono text-[10px] text-medium-gray/70">
        <span>e = endeavors</span>
        <span>u = users</span>
        <span>d = discussions</span>
        <span>t = tasks</span>
        <span>s = stories</span>
      </div>
    </div>
  );
}

function CategoryBreakdown({ categories }: { categories: CategoryRow[] }) {
  if (categories.length === 0) {
    return <p className="mb-10 font-mono text-xs text-medium-gray">No categories found.</p>;
  }

  const max = Math.max(...categories.map((c) => c.count), 1);

  return (
    <div className="mb-10 space-y-2">
      {categories.map((cat) => {
        const widthPct = (cat.count / max) * 100;
        return (
          <div key={cat.category} className="flex items-center gap-3">
            <span className="w-32 shrink-0 truncate font-mono text-xs text-medium-gray text-right">
              {cat.category}
            </span>
            <div className="flex-1">
              <div
                className="h-5 bg-code-blue/60"
                style={{ width: `${Math.max(widthPct, 2)}%` }}
              />
            </div>
            <span className="w-10 shrink-0 font-mono text-xs text-code-blue text-right">
              {cat.count}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="font-mono text-xs text-medium-gray transition-colors hover:text-code-green"
    >
      {label} &rarr;
    </Link>
  );
}
