"use client";

import { useState, useEffect } from "react";

type QuickStats = {
  members: number;
  tasks_total: number;
  tasks_completed: number;
  milestones_total: number;
  milestones_completed: number;
  discussions: number;
  stories: number;
};

export function EndeavorQuickStats({ endeavorId }: { endeavorId: string }) {
  const [stats, setStats] = useState<QuickStats | null>(null);

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/stats`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setStats)
      .catch(() => {});
  }, [endeavorId]);

  if (!stats) return null;

  const items = [
    { label: "Members", value: stats.members, color: "text-code-green" },
    { label: "Tasks", value: `${stats.tasks_completed}/${stats.tasks_total}`, color: "text-code-blue" },
    { label: "Milestones", value: `${stats.milestones_completed}/${stats.milestones_total}`, color: "text-purple-400" },
    { label: "Discussions", value: stats.discussions, color: "text-yellow-400" },
    { label: "Stories", value: stats.stories, color: "text-orange-400" },
  ].filter((i) => {
    const v = typeof i.value === "string" ? parseInt(i.value.split("/")[1]) : i.value;
    return v > 0;
  });

  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className={`text-sm font-bold ${item.color}`}>{item.value}</span>
          <span className="text-xs text-medium-gray">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
