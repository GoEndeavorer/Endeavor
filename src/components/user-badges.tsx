"use client";

import { useState, useEffect } from "react";
import { Tooltip } from "@/components/tooltip";

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
        <Tooltip
          key={badge.id}
          content={`${badge.name} — ${badge.description}`}
          position="top"
        >
          <span
            className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-xs font-mono transition-all duration-200 cursor-default select-none ${
              badge.earned
                ? `${badge.color} border-current hover:bg-current/10`
                : "text-medium-gray/30 border-medium-gray/10 opacity-50"
            }`}
          >
            <span className="font-bold text-sm leading-none">{badge.icon}</span>
            <span className={badge.earned ? "" : "line-through"}>{badge.name}</span>
          </span>
        </Tooltip>
      ))}
      {showAll && (
        <span className="text-xs font-mono text-medium-gray/50 self-center ml-1">
          {earned.length}/{badges.length} earned
        </span>
      )}
    </div>
  );
}
