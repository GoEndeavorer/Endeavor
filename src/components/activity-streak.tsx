"use client";

import { useState, useEffect } from "react";

type StreakData = {
  currentStreak: number;
  longestStreak: number;
  todayActive: boolean;
};

export function ActivityStreak() {
  const [streak, setStreak] = useState<StreakData | null>(null);

  useEffect(() => {
    fetch("/api/activity/streak")
      .then((r) => (r.ok ? r.json() : null))
      .then(setStreak)
      .catch(() => {});
  }, []);

  if (!streak) return null;

  return (
    <div className="border border-medium-gray/20 p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
        {"// streak"}
      </h3>
      <div className="flex items-end gap-6">
        <div>
          <p className="text-3xl font-bold tabular-nums">
            {streak.currentStreak}
          </p>
          <p className="text-xs text-medium-gray mt-0.5">
            day{streak.currentStreak !== 1 ? "s" : ""} active
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-medium-gray">
            Best: <span className="text-light-gray">{streak.longestStreak}</span>
          </p>
          <p className="mt-0.5 text-xs">
            {streak.todayActive ? (
              <span className="text-code-green">Active today</span>
            ) : (
              <span className="text-yellow-400">Not yet today</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
