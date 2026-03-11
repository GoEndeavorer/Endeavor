"use client";

import { useState, useMemo } from "react";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

/* ── Level formula ──────────────────────────────────────────────── */
function levelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

function xpForLevel(level: number): number {
  return (level - 1) * (level - 1) * 50;
}

/* ── Rank definitions ───────────────────────────────────────────── */
type Rank = {
  name: string;
  minLevel: number;
  maxLevel: number;
  color: string;
  bg: string;
};

const RANKS: Rank[] = [
  { name: "Newcomer", minLevel: 1, maxLevel: 1, color: "text-medium-gray", bg: "bg-medium-gray/15" },
  { name: "Explorer", minLevel: 2, maxLevel: 3, color: "text-light-gray", bg: "bg-light-gray/10" },
  { name: "Contributor", minLevel: 4, maxLevel: 6, color: "text-code-green", bg: "bg-code-green/10" },
  { name: "Builder", minLevel: 7, maxLevel: 10, color: "text-code-blue", bg: "bg-code-blue/10" },
  { name: "Architect", minLevel: 11, maxLevel: 15, color: "text-code-blue", bg: "bg-code-blue/10" },
  { name: "Visionary", minLevel: 16, maxLevel: 20, color: "text-purple-400", bg: "bg-purple-400/10" },
  { name: "Trailblazer", minLevel: 21, maxLevel: 30, color: "text-purple-400", bg: "bg-purple-400/10" },
  { name: "Legend", minLevel: 31, maxLevel: 50, color: "text-yellow-400", bg: "bg-yellow-400/10" },
  { name: "Icon", minLevel: 51, maxLevel: 999, color: "text-yellow-400", bg: "bg-yellow-400/10" },
];

function rankForLevel(level: number): Rank {
  return RANKS.find((r) => level >= r.minLevel && level <= r.maxLevel) || RANKS[0];
}

/* ── XP sources ─────────────────────────────────────────────────── */
const XP_SOURCES = [
  { action: "Create an endeavor", xp: 100, icon: "\u26A1" },
  { action: "Join an endeavor", xp: 50, icon: "\u{1F91D}" },
  { action: "Publish a story", xp: 75, icon: "\u{1F4DD}" },
  { action: "Receive an endorsement", xp: 25, icon: "\u{1F44D}" },
  { action: "Complete a milestone", xp: 150, icon: "\u{1F3AF}" },
  { action: "7-day activity streak", xp: 200, icon: "\u{1F525}" },
  { action: "Invite a new member", xp: 50, icon: "\u{1F4E8}" },
  { action: "Post a discussion reply", xp: 10, icon: "\u{1F4AC}" },
  { action: "Complete a challenge", xp: 300, icon: "\u{1F3C6}" },
  { action: "Get featured on trending", xp: 500, icon: "\u{1F680}" },
];

/* ── Visible level range ────────────────────────────────────────── */
const DISPLAY_LEVELS = 55;

export default function LevelsPage() {
  const { data: session } = useSession();
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);

  // Mock user XP — in production this would come from the API
  const userXp = 2400;
  const userLevel = levelFromXp(userXp);
  const userRank = rankForLevel(userLevel);
  const xpCurrent = xpForLevel(userLevel);
  const xpNext = xpForLevel(userLevel + 1);
  const xpProgress = userXp - xpCurrent;
  const xpNeeded = xpNext - xpCurrent;
  const progressPct = xpNeeded > 0 ? Math.round((xpProgress / xpNeeded) * 100) : 100;

  // Pre-compute levels
  const levels = useMemo(() => {
    return Array.from({ length: DISPLAY_LEVELS }, (_, i) => {
      const level = i + 1;
      const requiredXp = xpForLevel(level);
      const nextXp = xpForLevel(level + 1);
      const rank = rankForLevel(level);
      return { level, requiredXp, nextXp, rank };
    });
  }, []);

  return (
    <div className="min-h-screen bg-black">
      <AppHeader breadcrumb={{ label: "Levels & Ranks", href: "/levels" }} />

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        {/* Header */}
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// levels & ranks"}
        </p>
        <h1 className="mb-2 text-3xl font-bold">Levels &amp; Ranks</h1>
        <p className="mb-8 text-sm text-medium-gray">
          Earn XP through contributions and climb the ranks. Your level is
          calculated as{" "}
          <code className="border border-medium-gray/30 bg-medium-gray/10 px-1.5 py-0.5 font-mono text-xs text-code-green">
            level = floor(sqrt(xp / 50)) + 1
          </code>
        </p>

        {/* Current level card */}
        {session && (
          <div className="mb-10 border border-medium-gray/20 p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// your rank"}
            </p>
            <div className="flex items-center gap-6">
              <div>
                <p className="font-mono text-5xl font-bold text-white">
                  {userLevel}
                </p>
                <p className={`mt-1 text-sm font-semibold ${userRank.color}`}>
                  {userRank.name}
                </p>
              </div>
              <div className="flex-1">
                <div className="flex items-baseline justify-between">
                  <p className="text-sm text-medium-gray">
                    <span className="font-mono text-white">{userXp.toLocaleString()}</span>{" "}
                    XP total
                  </p>
                  <p className="text-xs text-medium-gray">
                    <span className="font-mono text-light-gray">{xpProgress.toLocaleString()}</span>{" "}
                    / {xpNeeded.toLocaleString()} to next level
                  </p>
                </div>
                <div className="mt-2 h-3 w-full bg-medium-gray/20">
                  <div
                    className="h-3 bg-code-green transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                <p className="mt-1 text-right text-[10px] text-medium-gray">
                  {progressPct}% to Level {userLevel + 1}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Rank tiers overview */}
        <section className="mb-10">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// rank tiers"}
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {RANKS.map((rank) => {
              const isCurrent = session && userLevel >= rank.minLevel && userLevel <= rank.maxLevel;
              return (
                <div
                  key={rank.name}
                  className={`border p-3 transition-colors ${
                    isCurrent
                      ? "border-code-green/50 bg-code-green/5"
                      : "border-medium-gray/15"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-bold ${rank.color}`}>
                      {rank.name}
                    </p>
                    {isCurrent && (
                      <span className="bg-code-green/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-code-green">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="mt-1 font-mono text-xs text-medium-gray">
                    Level {rank.minLevel}
                    {rank.maxLevel < 999 ? `\u2013${rank.maxLevel}` : "+"}
                  </p>
                  <p className="mt-0.5 font-mono text-[10px] text-medium-gray/60">
                    {xpForLevel(rank.minLevel).toLocaleString()} XP
                    {rank.maxLevel < 999
                      ? ` \u2013 ${xpForLevel(rank.maxLevel + 1).toLocaleString()} XP`
                      : "+"}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Level breakdown table */}
        <section className="mb-12">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// all levels"}
          </p>
          <div className="space-y-1">
            {levels.map(({ level, requiredXp, nextXp, rank }) => {
              const isUser = session && level === userLevel;
              const isPast = session && level < userLevel;
              const barWidth = isPast ? 100 : isUser ? progressPct : 0;

              return (
                <div
                  key={level}
                  onMouseEnter={() => setHoveredLevel(level)}
                  onMouseLeave={() => setHoveredLevel(null)}
                  className={`group flex items-center gap-3 border px-3 py-2 transition-colors ${
                    isUser
                      ? "border-code-green/50 bg-code-green/5"
                      : hoveredLevel === level
                      ? "border-medium-gray/30"
                      : "border-transparent"
                  }`}
                >
                  {/* Level number */}
                  <span
                    className={`w-8 text-right font-mono text-sm font-bold ${
                      isUser ? "text-code-green" : isPast ? "text-light-gray" : "text-medium-gray/50"
                    }`}
                  >
                    {level}
                  </span>

                  {/* Rank name */}
                  <span
                    className={`w-24 text-xs font-semibold ${rank.color} ${
                      !isUser && !isPast ? "opacity-50" : ""
                    }`}
                  >
                    {rank.name}
                  </span>

                  {/* XP bar */}
                  <div className="flex-1">
                    <div className="h-2 w-full bg-medium-gray/10">
                      <div
                        className={`h-2 transition-all duration-300 ${
                          isUser
                            ? "bg-code-green"
                            : isPast
                            ? "bg-code-blue/60"
                            : "bg-transparent"
                        }`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>

                  {/* XP required */}
                  <span
                    className={`w-24 text-right font-mono text-[11px] ${
                      isUser ? "text-code-green" : "text-medium-gray/60"
                    }`}
                  >
                    {requiredXp.toLocaleString()} XP
                  </span>

                  {/* Current indicator */}
                  {isUser && (
                    <span className="ml-1 h-2 w-2 bg-code-green" />
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-2 text-center text-[10px] text-medium-gray/50">
            Levels continue infinitely beyond 55
          </p>
        </section>

        {/* How to earn XP */}
        <section>
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// how to earn xp"}
          </p>
          <p className="mb-4 text-sm text-medium-gray">
            Every meaningful action on Endeavor earns experience points. Here
            are the primary ways to level up:
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {XP_SOURCES.map((src) => (
              <div
                key={src.action}
                className="flex items-center gap-3 border border-medium-gray/15 p-3 transition-colors hover:border-code-green/30"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center bg-medium-gray/10 text-lg">
                  {src.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-light-gray">
                    {src.action}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-sm font-bold text-code-green">
                  +{src.xp}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
