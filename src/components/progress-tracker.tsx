"use client";

import { useState, useEffect } from "react";

type ProgressData = {
  milestones: { total: number; completed: number };
  tasks: { total: number; completed: number };
  members: { total: number; target: number | null };
  funding: { raised: number; goal: number | null; enabled: boolean };
};

export function ProgressTracker({ endeavorId }: { endeavorId: string }) {
  const [data, setData] = useState<ProgressData | null>(null);

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setData({
            milestones: {
              total: d.stats?.milestones || 0,
              completed: d.stats?.milestonesCompleted || 0,
            },
            tasks: {
              total: d.stats?.tasks || 0,
              completed: d.stats?.tasksCompleted || 0,
            },
            members: {
              total: d.memberCount || 0,
              target: d.capacity,
            },
            funding: {
              raised: d.fundingRaised || 0,
              goal: d.fundingGoal,
              enabled: d.fundingEnabled,
            },
          });
        }
      });
  }, [endeavorId]);

  if (!data) return null;

  const bars: { label: string; current: number; target: number; color: string }[] = [];

  if (data.milestones.total > 0) {
    bars.push({
      label: "Milestones",
      current: data.milestones.completed,
      target: data.milestones.total,
      color: "bg-purple-400",
    });
  }

  if (data.tasks.total > 0) {
    bars.push({
      label: "Tasks",
      current: data.tasks.completed,
      target: data.tasks.total,
      color: "bg-code-blue",
    });
  }

  if (data.members.target && data.members.target > 0) {
    bars.push({
      label: "Team",
      current: data.members.total,
      target: data.members.target,
      color: "bg-code-green",
    });
  }

  if (data.funding.enabled && data.funding.goal && data.funding.goal > 0) {
    bars.push({
      label: "Funding",
      current: data.funding.raised,
      target: data.funding.goal,
      color: "bg-yellow-400",
    });
  }

  if (bars.length === 0) return null;

  return (
    <div className="border border-medium-gray/20 p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
        {"// progress"}
      </h3>
      <div className="space-y-3">
        {bars.map((bar) => {
          const pct = Math.min(Math.round((bar.current / bar.target) * 100), 100);
          return (
            <div key={bar.label}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs text-medium-gray">{bar.label}</span>
                <span className="text-xs text-white">
                  {bar.label === "Funding"
                    ? `$${(bar.current / 100).toFixed(0)} / $${(bar.target / 100).toFixed(0)}`
                    : `${bar.current} / ${bar.target}`}
                </span>
              </div>
              <div className="h-1.5 w-full bg-medium-gray/10">
                <div
                  className={`h-full ${bar.color} transition-all duration-500`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
