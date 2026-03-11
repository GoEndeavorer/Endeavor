"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { AchievementCard } from "@/components/achievement-card";
import { useToast } from "@/components/toast";

type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  criteria: { type: string; threshold: number };
  xp_reward: number;
};

type EarnedAchievement = {
  achievement_id: string;
  earned_at: string;
};

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "community", label: "Community" },
  { key: "contribution", label: "Contribution" },
  { key: "milestone", label: "Milestone" },
  { key: "skill", label: "Skill" },
  { key: "special", label: "Special" },
];

export default function AchievementsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [earned, setEarned] = useState<EarnedAchievement[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [totalXp, setTotalXp] = useState(0);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  const loadData = useCallback(async () => {
    if (!session) return;

    try {
      const [achievementsRes, earnedRes] = await Promise.all([
        fetch("/api/achievements"),
        fetch(`/api/users/${session.user.id}/achievements`),
      ]);

      const achievementsData = await achievementsRes.json();
      const earnedData = await earnedRes.json();

      setAchievements(achievementsData.achievements || []);
      setEarned(
        (earnedData.achievements || []).map((a: { achievement_id: string; earned_at: string }) => ({
          achievement_id: a.achievement_id,
          earned_at: a.earned_at,
        }))
      );
      setTotalXp(earnedData.totalXp || 0);
    } catch {
      // Silently fail on load
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function checkAchievements() {
    setChecking(true);
    try {
      const res = await fetch("/api/achievements/check", { method: "POST" });
      const data = await res.json();

      if (data.stats) setStats(data.stats);
      if (data.totalXp !== undefined) setTotalXp(data.totalXp);

      if (data.newlyEarned?.length > 0) {
        const names = data.newlyEarned
          .map((a: { name: string }) => a.name)
          .join(", ");
        toast(`Achievement${data.newlyEarned.length > 1 ? "s" : ""} unlocked: ${names}`);
        // Refresh the earned list
        await loadData();
      } else {
        toast("No new achievements unlocked. Keep going!");
      }
    } catch {
      toast("Failed to check achievements.");
    } finally {
      setChecking(false);
    }
  }

  const earnedMap = new Map(earned.map((e) => [e.achievement_id, e.earned_at]));
  const earnedCount = earned.length;
  const totalCount = achievements.length;
  const progressPct =
    totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0;

  const filtered =
    activeCategory === "all"
      ? achievements
      : achievements.filter((a) => a.category === activeCategory);

  // Sort: earned first, then by XP reward
  const sorted = [...filtered].sort((a, b) => {
    const aEarned = earnedMap.has(a.id) ? 1 : 0;
    const bEarned = earnedMap.has(b.id) ? 1 : 0;
    if (aEarned !== bEarned) return bEarned - aEarned;
    return a.xp_reward - b.xp_reward;
  });

  // XP level calculation
  const level = Math.floor(totalXp / 500) + 1;
  const xpInLevel = totalXp % 500;
  const xpForNextLevel = 500;

  if (loading) {
    return (
      <div className="min-h-screen">
        <AppHeader
          breadcrumb={{ label: "Achievements", href: "/achievements" }}
        />
        <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 animate-pulse bg-medium-gray/10" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader
        breadcrumb={{ label: "Achievements", href: "/achievements" }}
      />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Achievements</h1>
            <p className="text-sm text-medium-gray">
              {earnedCount} / {totalCount} unlocked ({progressPct}%)
            </p>
          </div>
          <button
            onClick={checkAchievements}
            disabled={checking}
            className="border border-code-green px-4 py-2 text-xs font-bold uppercase text-code-green transition-colors hover:bg-code-green hover:text-black disabled:opacity-50"
          >
            {checking ? "Checking..." : "Check Progress"}
          </button>
        </div>

        {/* Overall progress bar */}
        <div className="mb-6">
          <div className="h-2 w-full bg-medium-gray/20">
            <div
              className="h-2 bg-code-green transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* XP / Level display */}
        <div className="mb-8 flex gap-6 border border-medium-gray/20 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// level"}
            </p>
            <p className="mt-1 text-3xl font-bold font-mono text-white">
              {level}
            </p>
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// experience"}
            </p>
            <p className="mt-1 text-sm text-medium-gray">
              <span className="font-mono text-white">{totalXp}</span> XP total
              &middot;{" "}
              <span className="font-mono text-white">{xpInLevel}</span> /{" "}
              {xpForNextLevel} to next level
            </p>
            <div className="mt-2 h-1 w-full bg-medium-gray/20">
              <div
                className="h-1 bg-code-blue transition-all duration-500"
                style={{
                  width: `${Math.round((xpInLevel / xpForNextLevel) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Category filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.key;
            const countInCat =
              cat.key === "all"
                ? achievements.length
                : achievements.filter((a) => a.category === cat.key).length;
            const earnedInCat =
              cat.key === "all"
                ? earnedCount
                : achievements.filter(
                    (a) => a.category === cat.key && earnedMap.has(a.id)
                  ).length;

            return (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  isActive
                    ? "border-code-green bg-code-green/10 text-code-green"
                    : "border-medium-gray/20 text-medium-gray hover:border-medium-gray/40"
                }`}
              >
                {cat.label}{" "}
                <span className="font-mono">
                  ({earnedInCat}/{countInCat})
                </span>
              </button>
            );
          })}
        </div>

        {/* Achievement list */}
        <section>
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// achievements"}
          </h2>

          {sorted.length === 0 ? (
            <p className="text-sm text-medium-gray">
              No achievements in this category yet.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {sorted.map((a) => {
                const earnedAt = earnedMap.get(a.id) || null;
                const criteria = a.criteria;
                const progress =
                  !earnedAt && criteria?.type && criteria?.threshold
                    ? {
                        current: stats[criteria.type] ?? 0,
                        threshold: criteria.threshold,
                      }
                    : null;

                return (
                  <AchievementCard
                    key={a.id}
                    name={a.name}
                    description={a.description}
                    icon={a.icon}
                    category={a.category}
                    xpReward={a.xp_reward}
                    earnedAt={earnedAt}
                    progress={progress}
                  />
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
