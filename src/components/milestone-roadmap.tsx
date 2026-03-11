"use client";

import { useState, useEffect } from "react";
import { formatTimeAgo } from "@/lib/time";

type Milestone = {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
};

export function MilestoneRoadmap({ endeavorId }: { endeavorId: string }) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/milestones`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setMilestones(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [endeavorId]);

  if (loading) {
    return (
      <div className="border border-medium-gray/20 p-4">
        <div className="mb-4 h-4 w-32 animate-pulse bg-medium-gray/10" />
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 animate-pulse">
              <div className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-medium-gray/10" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 bg-medium-gray/10" />
                <div className="h-3 w-24 bg-medium-gray/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (milestones.length === 0) {
    return (
      <div className="border border-medium-gray/20 p-8 text-center">
        <p className="text-sm text-medium-gray font-mono">
          No milestones defined
        </p>
      </div>
    );
  }

  const sorted = [...milestones].sort(
    (a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
  );

  const completedCount = sorted.filter((m) => m.completed).length;
  const pct = Math.round((completedCount / sorted.length) * 100);
  const currentIndex = sorted.findIndex((m) => !m.completed);

  return (
    <div className="border border-medium-gray/20 p-4">
      <h3 className="mb-1 text-xs font-semibold uppercase tracking-widest text-code-green font-mono">
        {"// milestones"}
      </h3>

      <div className="mb-4 flex items-center gap-3">
        <div className="h-1.5 flex-1 bg-medium-gray/10">
          <div
            className="h-full bg-code-green transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="shrink-0 text-xs font-mono text-white">
          {pct}%
        </span>
      </div>

      <div className="relative">
        {sorted.map((milestone, i) => {
          const isCompleted = milestone.completed;
          const isCurrent = i === currentIndex;
          const isLast = i === sorted.length - 1;

          return (
            <div key={milestone.id} className="relative flex gap-4">
              {/* Vertical connecting line */}
              {!isLast && (
                <div
                  className="absolute left-[7px] top-5 w-0.5"
                  style={{
                    height: "calc(100% - 4px)",
                    backgroundColor: isCompleted ? "#00FF00" : "transparent",
                    backgroundImage: isCompleted
                      ? "none"
                      : "repeating-linear-gradient(to bottom, #666 0, #666 4px, transparent 4px, transparent 8px)",
                  }}
                />
              )}

              {/* Indicator dot */}
              <div className="relative z-10 mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                {isCompleted ? (
                  <div className="h-4 w-4 rounded-full bg-code-green" />
                ) : isCurrent ? (
                  <div className="relative h-4 w-4">
                    <div className="absolute inset-0 animate-ping rounded-full bg-code-blue opacity-40" />
                    <div className="absolute inset-[3px] rounded-full bg-code-blue" />
                    <div className="h-4 w-4 rounded-full border-2 border-code-blue" />
                  </div>
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-light-gray" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-6">
                <p
                  className={`text-sm font-mono font-medium ${
                    isCompleted
                      ? "text-code-green"
                      : isCurrent
                        ? "text-code-blue"
                        : "text-light-gray"
                  }`}
                >
                  {milestone.title}
                </p>
                <p className="mt-0.5 text-xs font-mono text-medium-gray">
                  {isCompleted && milestone.completedAt
                    ? `completed ${formatTimeAgo(milestone.completedAt)}`
                    : `target: ${new Date(milestone.targetDate).toLocaleDateString()}`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
