"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

type Period = "all" | "month" | "week";

type LeaderboardEntry = {
  userId: string;
  name: string;
  image: string | null;
  xp: number;
  level: number;
  title: string;
  rank: number;
};

const PERIOD_TABS: { id: Period; label: string }[] = [
  { id: "all", label: "All Time" },
  { id: "month", label: "This Month" },
  { id: "week", label: "This Week" },
];

function rankAccent(rank: number): string {
  if (rank === 1) return "text-yellow-400";
  if (rank === 2) return "text-light-gray";
  if (rank === 3) return "text-orange-400";
  return "text-medium-gray";
}

function rankBorder(rank: number): string {
  if (rank === 1) return "border-yellow-400/40";
  if (rank === 2) return "border-light-gray/30";
  if (rank === 3) return "border-orange-400/30";
  return "border-medium-gray/20";
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("all");

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?period=${period}&limit=25`)
      .then((r) => r.json())
      .then((data) => setEntries(Array.isArray(data) ? data : []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="min-h-screen bg-black">
      <AppHeader breadcrumb={{ label: "Leaderboard", href: "/leaderboard" }} />

      <main className="mx-auto max-w-2xl px-4 pt-24 pb-16">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// leaderboard"}
        </p>
        <h1 className="mb-2 text-3xl font-bold">Leaderboard</h1>
        <p className="mb-6 text-sm text-medium-gray">
          Top contributors ranked by experience points across the Endeavor
          platform.
        </p>

        {/* Period selector tabs */}
        <div className="mb-6 flex gap-2">
          {PERIOD_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setPeriod(t.id)}
              className={`border px-4 py-2 text-xs font-semibold uppercase transition-colors ${
                period === t.id
                  ? "border-code-green bg-code-green text-black"
                  : "border-medium-gray/50 text-medium-gray hover:border-code-green hover:text-code-green"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-16 w-full animate-pulse bg-medium-gray/10"
              />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <p className="py-12 text-center text-sm text-medium-gray">
            No activity yet for this period.
          </p>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <Link
                key={entry.userId}
                href={`/users/${entry.userId}`}
                className={`group flex items-center gap-4 border p-4 transition-colors hover:border-code-green/50 ${rankBorder(entry.rank)}`}
              >
                {/* Rank */}
                <span
                  className={`w-8 text-center text-sm font-bold ${rankAccent(entry.rank)}`}
                >
                  {entry.rank}
                </span>

                {/* Avatar */}
                {entry.image ? (
                  <img
                    src={entry.image}
                    alt={entry.name}
                    className="h-10 w-10 object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center bg-accent text-sm font-bold">
                    {entry.name.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Name + title */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold transition-colors group-hover:text-code-green">
                      {entry.name}
                    </p>
                    <span className="shrink-0 border border-code-blue/40 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-code-blue">
                      Lv.{entry.level}
                    </span>
                  </div>
                  <p className="text-xs text-medium-gray">{entry.title}</p>
                </div>

                {/* XP */}
                <div className="text-right">
                  <p className="text-lg font-bold text-code-green">
                    {entry.xp.toLocaleString()}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-medium-gray">
                    XP
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
