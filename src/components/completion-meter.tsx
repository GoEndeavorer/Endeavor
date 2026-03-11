"use client";

import { useState, useEffect } from "react";

type Stats = {
  members: number;
  tasks: { total: number; completed: number };
  milestones: { total: number; completed: number };
};

export function CompletionMeter({ endeavorId }: { endeavorId: string }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/stats`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [endeavorId]);

  if (loading || !stats) return null;

  const taskPercent =
    stats.tasks.total > 0
      ? Math.round((stats.tasks.completed / stats.tasks.total) * 100)
      : 0;

  const milestonePercent =
    stats.milestones.total > 0
      ? Math.round((stats.milestones.completed / stats.milestones.total) * 100)
      : 0;

  // Only show if there are tasks or milestones
  if (stats.tasks.total === 0 && stats.milestones.total === 0) return null;

  return (
    <div className="border border-medium-gray/20 p-4">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
        {"// completion"}
      </h4>
      <div className="space-y-3">
        {stats.tasks.total > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-medium-gray">Tasks</span>
              <span className="text-xs font-mono text-code-green">
                {stats.tasks.completed}/{stats.tasks.total}
              </span>
            </div>
            <div className="h-1.5 w-full bg-medium-gray/10">
              <div
                className="h-full bg-code-green transition-all duration-500"
                style={{ width: `${taskPercent}%` }}
              />
            </div>
          </div>
        )}
        {stats.milestones.total > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-medium-gray">Milestones</span>
              <span className="text-xs font-mono text-code-blue">
                {stats.milestones.completed}/{stats.milestones.total}
              </span>
            </div>
            <div className="h-1.5 w-full bg-medium-gray/10">
              <div
                className="h-full bg-code-blue transition-all duration-500"
                style={{ width: `${milestonePercent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
