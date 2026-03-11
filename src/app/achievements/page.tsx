"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { ACHIEVEMENTS, type AchievementDef } from "@/lib/achievements";
import { Confetti } from "@/components/confetti";

const TIER_COLORS = {
  bronze: "border-orange-700/50 bg-orange-700/5",
  silver: "border-gray-400/50 bg-gray-400/5",
  gold: "border-yellow-400/50 bg-yellow-400/5",
  platinum: "border-purple-400/50 bg-purple-400/5",
};

const TIER_LABELS = {
  bronze: "text-orange-700",
  silver: "text-gray-400",
  gold: "text-yellow-400",
  platinum: "text-purple-400",
};

export default function AchievementsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [unlocked, setUnlocked] = useState<{ key: string; unlockedAt: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [newlyUnlocked, setNewlyUnlocked] = useState<string[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  useEffect(() => {
    if (!session) return;
    fetch("/api/achievements")
      .then((r) => r.json())
      .then((data) => setUnlocked(data.unlocked || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session]);

  async function checkAchievements() {
    setChecking(true);
    const res = await fetch("/api/achievements", { method: "POST" });
    const data = await res.json();
    if (data.newlyUnlocked?.length > 0) {
      setNewlyUnlocked(data.newlyUnlocked);
      setShowConfetti(true);
      // Refresh unlocked list
      const refresh = await fetch("/api/achievements");
      const refreshData = await refresh.json();
      setUnlocked(refreshData.unlocked || []);
    }
    setChecking(false);
  }

  const unlockedKeys = new Set(unlocked.map((u) => u.key));
  const unlockedCount = unlocked.length;
  const totalCount = ACHIEVEMENTS.length;
  const progressPct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

  // Group by tier
  const grouped = {
    platinum: ACHIEVEMENTS.filter((a) => a.tier === "platinum"),
    gold: ACHIEVEMENTS.filter((a) => a.tier === "gold"),
    silver: ACHIEVEMENTS.filter((a) => a.tier === "silver"),
    bronze: ACHIEVEMENTS.filter((a) => a.tier === "bronze"),
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Achievements", href: "/achievements" }} />
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
      <AppHeader breadcrumb={{ label: "Achievements", href: "/achievements" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Achievements</h1>
            <p className="text-sm text-medium-gray">
              {unlockedCount} / {totalCount} unlocked ({progressPct}%)
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

        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-2 w-full bg-medium-gray/20">
            <div
              className="h-2 bg-code-green transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Confetti celebration */}
        <Confetti active={showConfetti} />

        {/* Newly unlocked */}
        {newlyUnlocked.length > 0 && (
          <div className="mb-8 border border-code-green/50 bg-code-green/5 p-4">
            <p className="mb-2 text-sm font-bold text-code-green">New achievements unlocked!</p>
            <div className="flex flex-wrap gap-2">
              {newlyUnlocked.map((key) => {
                const a = ACHIEVEMENTS.find((x) => x.key === key);
                return a ? (
                  <span key={key} className="border border-code-green/30 px-3 py-1 text-sm text-code-green">
                    {a.icon} {a.title}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Achievement groups */}
        {(Object.entries(grouped) as [keyof typeof grouped, AchievementDef[]][]).map(([tier, achievements]) => (
          <section key={tier} className="mb-8">
            <h2 className={`mb-4 text-xs font-semibold uppercase tracking-widest ${TIER_LABELS[tier]}`}>
              {"// "}{tier}
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {achievements.map((a) => {
                const isUnlocked = unlockedKeys.has(a.key);
                const unlockedData = unlocked.find((u) => u.key === a.key);
                return (
                  <div
                    key={a.key}
                    className={`border p-4 transition-colors ${
                      isUnlocked
                        ? TIER_COLORS[tier]
                        : "border-medium-gray/10 opacity-40"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`text-2xl font-mono font-bold ${isUnlocked ? a.color : "text-medium-gray/30"}`}>
                        {a.icon}
                      </span>
                      <div className="flex-1">
                        <p className={`font-semibold ${isUnlocked ? "text-white" : "text-medium-gray"}`}>
                          {a.title}
                        </p>
                        <p className="text-xs text-medium-gray">{a.description}</p>
                        {isUnlocked && unlockedData && (
                          <p className="mt-1 text-xs text-code-green">
                            Unlocked {new Date(unlockedData.unlockedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      {isUnlocked && (
                        <span className="text-code-green text-sm">&#10003;</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </div>
  );
}
