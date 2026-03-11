"use client";

import { useState, useEffect } from "react";

export function StreakCounter() {
  const [streak, setStreak] = useState<{ current_streak: number; longest_streak: number; total_active_days: number } | null>(null);

  useEffect(() => {
    fetch("/api/streaks")
      .then((r) => (r.ok ? r.json() : null))
      .then(setStreak);
  }, []);

  if (!streak || streak.current_streak === 0) return null;

  return (
    <div className="inline-flex items-center gap-2 border border-code-green/30 px-3 py-1.5">
      <span className="text-code-green font-bold text-sm">{streak.current_streak}</span>
      <span className="text-xs text-medium-gray">day streak</span>
      {streak.current_streak >= 7 && (
        <span className="text-xs text-yellow-400">*</span>
      )}
    </div>
  );
}
