"use client";

import { useState, useEffect } from "react";

type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earned: boolean;
};

export function UserBadges({ userId, showAll = false }: { userId: string; showAll?: boolean }) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/badges?userId=${userId}`)
      .then((r) => r.ok ? r.json() : [])
      .then(setBadges)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return null;

  const earned = badges.filter((b) => b.earned);
  const displayed = showAll ? badges : earned;

  if (displayed.length === 0 && !showAll) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {displayed.map((badge) => (
        <span
          key={badge.id}
          title={`${badge.name}: ${badge.description}`}
          className={`inline-flex items-center gap-1 border px-2 py-1 text-xs font-mono transition-colors ${
            badge.earned
              ? `${badge.color} border-current`
              : "text-medium-gray/30 border-medium-gray/10"
          }`}
        >
          <span className="font-bold">{badge.icon}</span>
          <span className={badge.earned ? "" : "line-through"}>{badge.name}</span>
        </span>
      ))}
    </div>
  );
}
