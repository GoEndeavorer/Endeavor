"use client";

import { useState, useEffect } from "react";

type ProgressData = {
  tasks: { total: number; done: number };
  milestones: { total: number; completed: number };
  members: { current: number; capacity: number | null };
  funding: { raised: number; goal: number | null; enabled: boolean };
};

export function EndeavorProgress({ endeavorId }: { endeavorId: string }) {
  const [data, setData] = useState<ProgressData | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/endeavors/${endeavorId}/tasks`).then((r) => r.ok ? r.json() : []),
      fetch(`/api/endeavors/${endeavorId}`).then((r) => r.ok ? r.json() : null),
    ])
      .then(([tasks, endeavor]) => {
        if (!endeavor) return;
        const taskList = Array.isArray(tasks) ? tasks : [];
        setData({
          tasks: {
            total: taskList.length,
            done: taskList.filter((t: { status: string }) => t.status === "done").length,
          },
          milestones: {
            total: 0, // Will be fetched separately if needed
            completed: 0,
          },
          members: {
            current: endeavor.members?.length || 0,
            capacity: endeavor.capacity,
          },
          funding: {
            raised: endeavor.fundingRaised || 0,
            goal: endeavor.fundingGoal,
            enabled: endeavor.fundingEnabled || false,
          },
        });
      })
      .catch(() => {});
  }, [endeavorId]);

  if (!data) return null;

  const bars = [];

  // Tasks progress
  if (data.tasks.total > 0) {
    const pct = Math.round((data.tasks.done / data.tasks.total) * 100);
    bars.push({
      label: "Tasks",
      value: `${data.tasks.done}/${data.tasks.total}`,
      pct,
      color: "bg-code-green",
    });
  }

  // Members progress
  if (data.members.capacity) {
    const pct = Math.round((data.members.current / data.members.capacity) * 100);
    bars.push({
      label: "Team",
      value: `${data.members.current}/${data.members.capacity}`,
      pct: Math.min(100, pct),
      color: "bg-code-blue",
    });
  }

  // Funding progress
  if (data.funding.enabled && data.funding.goal && data.funding.goal > 0) {
    const pct = Math.round((data.funding.raised / data.funding.goal) * 100);
    bars.push({
      label: "Funded",
      value: `$${data.funding.raised.toLocaleString()}/$${data.funding.goal.toLocaleString()}`,
      pct: Math.min(100, pct),
      color: "bg-yellow-400",
    });
  }

  if (bars.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-medium-gray">
        {"// progress"}
      </h3>
      {bars.map((bar) => (
        <div key={bar.label}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-medium-gray">{bar.label}</span>
            <span className="text-light-gray">{bar.value} ({bar.pct}%)</span>
          </div>
          <div className="h-1.5 w-full bg-medium-gray/20">
            <div
              className={`h-1.5 ${bar.color} transition-all duration-500`}
              style={{ width: `${bar.pct}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
