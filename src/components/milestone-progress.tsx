"use client";

import { useEffect, useState } from "react";

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  targetDate: string | null;
  completed: boolean;
  completedAt: string | null;
  createdAt: string;
}

interface MilestoneProgressProps {
  endeavorId: string;
}

export function MilestoneProgress({ endeavorId }: MilestoneProgressProps) {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMilestones() {
      try {
        const res = await fetch(`/api/endeavors/${endeavorId}/milestones`);
        if (!res.ok) throw new Error("Failed to load milestones");
        const data = await res.json();
        setMilestones(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchMilestones();
  }, [endeavorId]);

  if (loading) {
    return (
      <div className="font-mono text-sm text-medium-gray animate-pulse p-4">
        Loading milestones...
      </div>
    );
  }

  if (error) {
    return (
      <div className="font-mono text-sm text-red-400 p-4">{error}</div>
    );
  }

  if (milestones.length === 0) {
    return (
      <div className="font-mono text-sm text-medium-gray p-4">
        No milestones yet.
      </div>
    );
  }

  const sorted = [...milestones].sort((a, b) => {
    if (a.targetDate && b.targetDate)
      return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
    if (a.targetDate) return -1;
    if (b.targetDate) return 1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  function formatDate(dateStr: string | null) {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="font-mono text-sm">
      <div className="relative">
        {sorted.map((ms, idx) => {
          const isLast = idx === sorted.length - 1;
          const isCompleted = ms.completed;

          return (
            <div key={ms.id} className="relative flex gap-3 pb-6 last:pb-0">
              {/* Vertical progress line */}
              {!isLast && (
                <div
                  className="absolute left-[9px] top-5 w-0.5 h-[calc(100%-8px)]"
                  style={{
                    backgroundColor: isCompleted ? "#00FF00" : "#333",
                  }}
                />
              )}

              {/* Checkbox visual */}
              <div className="relative z-10 flex-shrink-0 mt-0.5">
                <div
                  className="w-5 h-5 rounded border-2 flex items-center justify-center"
                  style={{
                    borderColor: isCompleted ? "#00FF00" : "#666",
                    backgroundColor: isCompleted
                      ? "rgba(0, 255, 0, 0.1)"
                      : "transparent",
                  }}
                >
                  {isCompleted && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2.5 6L5 8.5L9.5 3.5"
                        stroke="#00FF00"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <span
                  className="block leading-5"
                  style={{
                    color: isCompleted ? "#00FF00" : "#CCC",
                    textDecoration: isCompleted ? "line-through" : "none",
                    textDecorationColor: "rgba(0, 255, 0, 0.4)",
                  }}
                >
                  {ms.title}
                </span>
                {ms.targetDate && (
                  <span
                    className="block text-xs mt-0.5"
                    style={{ color: isCompleted ? "#00FF0088" : "#666" }}
                  >
                    {isCompleted ? "Completed" : "Target"}:{" "}
                    {formatDate(
                      isCompleted && ms.completedAt
                        ? ms.completedAt
                        : ms.targetDate
                    )}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
