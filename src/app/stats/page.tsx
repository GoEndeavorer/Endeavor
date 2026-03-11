"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

type WeekRow = { week: string; count: number };
type CategoryRow = { category: string; count: number };
type StatusRow = { status: string; count: number };
type CategoryMembersRow = { category: string; members: number };
type HourRow = { hour: number; count: number };

type PlatformStats = {
  totals: {
    users: number;
    endeavors: number;
    tasks: number;
    stories: number;
    discussions: number;
    endorsements: number;
  };
  usersPerWeek: WeekRow[];
  endeavorsPerWeek: WeekRow[];
  categoryBreakdown: CategoryRow[];
  statusBreakdown: StatusRow[];
  topCategoriesByMembers: CategoryMembersRow[];
  discussionsByHour: HourRow[];
  completionRate: number;
};

export default function StatsPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/platform-stats")
      .then((r) => (r.ok ? r.json() : null))
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <AppHeader breadcrumb={{ label: "Stats", href: "/stats" }} />

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <h1 className="mb-2 text-3xl font-bold text-code-green">
          Platform Stats
        </h1>
        <p className="mb-10 text-sm text-medium-gray">
          A live snapshot of the Endeavor community.
        </p>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse border border-medium-gray/10 bg-medium-gray/5"
              />
            ))}
          </div>
        ) : !stats ? (
          <p className="text-sm text-medium-gray">Failed to load stats.</p>
        ) : (
          <>
            {/* ── 1. Platform Totals ─────────────────────────────────────── */}
            <SectionHeader label="// platform totals" />
            <div className="mb-10 grid gap-4 sm:grid-cols-3">
              <StatCard
                value={stats.totals.users}
                label="Users"
                color="text-code-green"
              />
              <StatCard
                value={stats.totals.endeavors}
                label="Endeavors"
                color="text-code-blue"
              />
              <StatCard
                value={stats.totals.tasks}
                label="Tasks"
                color="text-light-gray"
              />
              <StatCard
                value={stats.totals.stories}
                label="Stories"
                color="text-purple-400"
              />
              <StatCard
                value={stats.totals.discussions}
                label="Discussions"
                color="text-code-blue"
              />
              <StatCard
                value={stats.totals.endorsements}
                label="Endorsements"
                color="text-yellow-400"
              />
            </div>

            {/* ── 2. Growth Charts ───────────────────────────────────────── */}
            <SectionHeader label="// growth" />
            <div className="mb-10 grid gap-6 sm:grid-cols-2">
              <WeeklyChart
                title="New Users / Week"
                data={stats.usersPerWeek}
                color="bg-code-green"
                accentText="text-code-green"
              />
              <WeeklyChart
                title="New Endeavors / Week"
                data={stats.endeavorsPerWeek}
                color="bg-code-blue"
                accentText="text-code-blue"
              />
            </div>

            {/* ── 3. Category Breakdown ──────────────────────────────────── */}
            <SectionHeader label="// endeavors by category" />
            <div className="mb-10">
              <HorizontalBarChart
                data={stats.categoryBreakdown.map((r) => ({
                  label: r.category,
                  value: r.count,
                }))}
                color="bg-code-blue"
              />
            </div>

            {/* ── 4. Status Breakdown ────────────────────────────────────── */}
            <SectionHeader label="// endeavors by status" />
            <div className="mb-10 grid gap-4 sm:grid-cols-5">
              {stats.statusBreakdown.map((s) => (
                <div
                  key={s.status}
                  className="border border-medium-gray/20 p-4 text-center"
                >
                  <p className="text-2xl font-bold text-light-gray">
                    {s.count.toLocaleString()}
                  </p>
                  <p className="mt-1 text-xs text-medium-gray capitalize">
                    {s.status}
                  </p>
                </div>
              ))}
            </div>

            {/* ── 5. Top Categories by Member Count ──────────────────────── */}
            <SectionHeader label="// top categories by members" />
            <div className="mb-10">
              <HorizontalBarChart
                data={stats.topCategoriesByMembers.map((r) => ({
                  label: r.category,
                  value: r.members,
                }))}
                color="bg-code-green"
              />
            </div>

            {/* ── 6. Most Active Time of Day ─────────────────────────────── */}
            <SectionHeader label="// discussions by hour (utc)" />
            <div className="mb-10">
              <HourlyChart data={stats.discussionsByHour} />
            </div>

            {/* ── 7. Average Completion Rate ─────────────────────────────── */}
            <SectionHeader label="// completion rate" />
            <div className="mb-10 border border-code-green/30 bg-code-green/5 p-6 text-center">
              <p className="text-4xl font-bold text-code-green">
                {stats.completionRate}%
              </p>
              <p className="mt-1 text-xs text-medium-gray">
                of non-draft endeavors have been completed
              </p>
            </div>

            {/* ── Navigation ─────────────────────────────────────────────── */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/leaderboard"
                className="text-xs text-medium-gray transition-colors hover:text-code-green"
              >
                View Leaderboard &rarr;
              </Link>
              <Link
                href="/activity"
                className="text-xs text-medium-gray transition-colors hover:text-code-green"
              >
                View Activity Feed &rarr;
              </Link>
              <Link
                href="/explore"
                className="text-xs text-medium-gray transition-colors hover:text-code-green"
              >
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

/* ── Shared Components ──────────────────────────────────────────────────────── */

function SectionHeader({ label }: { label: string }) {
  return (
    <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
      {label}
    </h2>
  );
}

function StatCard({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div className="border border-medium-gray/20 p-5 text-center">
      <p className={`text-3xl font-bold ${color}`}>
        {value.toLocaleString()}
      </p>
      <p className="mt-1 text-xs text-medium-gray">{label}</p>
    </div>
  );
}

function WeeklyChart({
  title,
  data,
  color,
  accentText,
}: {
  title: string;
  data: WeekRow[];
  color: string;
  accentText: string;
}) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="border border-medium-gray/20 p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-xs text-medium-gray">{title}</p>
        <p className={`text-sm font-bold ${accentText}`}>
          {total.toLocaleString()} total
        </p>
      </div>
      <div className="flex items-end gap-1" style={{ height: 80 }}>
        {data.map((d) => {
          const pct = (d.count / max) * 100;
          const weekLabel = new Date(d.week).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          return (
            <div
              key={d.week}
              className="group relative flex flex-1 flex-col items-center"
              style={{ height: "100%" }}
            >
              <div className="flex w-full flex-1 items-end">
                <div
                  className={`w-full ${color} transition-opacity group-hover:opacity-80`}
                  style={{
                    height: `${Math.max(pct, 4)}%`,
                    minHeight: 2,
                  }}
                />
              </div>
              <span className="mt-1 hidden text-[8px] text-medium-gray group-hover:block">
                {weekLabel}: {d.count}
              </span>
            </div>
          );
        })}
      </div>
      {data.length === 0 && (
        <p className="py-4 text-center text-xs text-medium-gray">
          No data yet
        </p>
      )}
    </div>
  );
}

function HorizontalBarChart({
  data,
  color,
}: {
  data: { label: string; value: number }[];
  color: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  if (data.length === 0) {
    return (
      <div className="border border-medium-gray/20 p-5">
        <p className="text-center text-xs text-medium-gray">No data yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {data.map((d) => {
        const pct = (d.value / max) * 100;
        return (
          <div key={d.label} className="flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-right text-xs text-light-gray">
              {d.label}
            </span>
            <div className="relative h-5 flex-1 bg-medium-gray/10">
              <div
                className={`absolute inset-y-0 left-0 ${color}`}
                style={{ width: `${Math.max(pct, 1)}%` }}
              />
            </div>
            <span className="w-10 text-right text-xs font-mono text-medium-gray">
              {d.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function HourlyChart({ data }: { data: HourRow[] }) {
  // Fill all 24 hours
  const hours = Array.from({ length: 24 }, (_, i) => {
    const match = data.find((d) => d.hour === i);
    return { hour: i, count: match?.count ?? 0 };
  });
  const max = Math.max(...hours.map((h) => h.count), 1);
  const peakHour = hours.reduce((best, h) =>
    h.count > best.count ? h : best,
  );

  return (
    <div className="border border-medium-gray/20 p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-xs text-medium-gray">Activity by Hour</p>
        <p className="text-sm font-bold text-code-blue">
          Peak: {formatHour(peakHour.hour)}
        </p>
      </div>
      <div className="flex items-end gap-px" style={{ height: 80 }}>
        {hours.map((h) => {
          const pct = (h.count / max) * 100;
          return (
            <div
              key={h.hour}
              className="group relative flex flex-1 flex-col items-center"
              style={{ height: "100%" }}
            >
              <div className="flex w-full flex-1 items-end">
                <div
                  className="w-full bg-code-blue transition-opacity group-hover:opacity-80"
                  style={{
                    height: `${Math.max(pct, 2)}%`,
                    minHeight: 1,
                  }}
                />
              </div>
              {h.hour % 6 === 0 && (
                <span className="mt-1 text-[8px] text-medium-gray">
                  {formatHour(h.hour)}
                </span>
              )}
              <span className="absolute -top-5 hidden whitespace-nowrap text-[9px] text-light-gray group-hover:block">
                {formatHour(h.hour)}: {h.count}
              </span>
            </div>
          );
        })}
      </div>
      {data.length === 0 && (
        <p className="py-4 text-center text-xs text-medium-gray">
          No data yet
        </p>
      )}
    </div>
  );
}

function formatHour(h: number): string {
  if (h === 0) return "12am";
  if (h === 12) return "12pm";
  return h < 12 ? `${h}am` : `${h - 12}pm`;
}
