"use client";

import { useState, useEffect } from "react";

type RankData = {
  xp: number;
  level: number;
  title: string;
  progressToNext: number;
};

export function UserLevel({ userId }: { userId: string }) {
  const [rank, setRank] = useState<RankData | null>(null);

  useEffect(() => {
    fetch(`/api/users/${userId}/rank`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setRank(data))
      .catch(() => {});
  }, [userId]);

  if (!rank) return null;

  return (
    <div className="border border-medium-gray/20 p-4">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
        {"// rank"}
      </h4>
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl font-bold text-code-green">{rank.level}</span>
        <div>
          <p className="text-sm font-semibold text-light-gray">{rank.title}</p>
          <p className="text-xs text-medium-gray font-mono">{rank.xp.toLocaleString()} XP</p>
        </div>
      </div>
      <div className="h-1.5 w-full bg-medium-gray/10">
        <div
          className="h-full bg-code-green transition-all duration-500"
          style={{ width: `${rank.progressToNext}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-medium-gray">
        {rank.progressToNext}% to Level {rank.level + 1}
      </p>
    </div>
  );
}
