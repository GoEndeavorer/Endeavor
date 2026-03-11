"use client";

import { useState, useEffect } from "react";

type HealthMetric = {
  label: string;
  value: number;
  max: number;
  status: "healthy" | "warning" | "critical";
};

type ProjectHealthProps = {
  endeavorId: string;
};

const statusColors = {
  healthy: "text-code-green border-code-green/30",
  warning: "text-yellow-400 border-yellow-400/30",
  critical: "text-red-400 border-red-400/30",
};

const barColors = {
  healthy: "bg-code-green",
  warning: "bg-yellow-400",
  critical: "bg-red-400",
};

export function ProjectHealth({ endeavorId }: ProjectHealthProps) {
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/activity-stats`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;

        const taskCompletion = data.total_tasks > 0
          ? Math.round((data.completed_tasks / data.total_tasks) * 100)
          : 0;
        const memberEngagement = Math.min(100, data.member_count * 10);
        const activityLevel = Math.min(100, (data.discussion_count + data.story_count) * 5);
        const milestoneProgress = data.milestone_count > 0
          ? Math.min(100, data.milestone_count * 20)
          : 0;

        const items: HealthMetric[] = [
          {
            label: "Task Completion",
            value: taskCompletion,
            max: 100,
            status: taskCompletion >= 60 ? "healthy" : taskCompletion >= 30 ? "warning" : "critical",
          },
          {
            label: "Member Engagement",
            value: memberEngagement,
            max: 100,
            status: memberEngagement >= 50 ? "healthy" : memberEngagement >= 20 ? "warning" : "critical",
          },
          {
            label: "Activity Level",
            value: activityLevel,
            max: 100,
            status: activityLevel >= 40 ? "healthy" : activityLevel >= 15 ? "warning" : "critical",
          },
          {
            label: "Milestone Progress",
            value: milestoneProgress,
            max: 100,
            status: milestoneProgress >= 40 ? "healthy" : milestoneProgress >= 20 ? "warning" : "critical",
          },
        ];

        setMetrics(items);
        setOverallScore(Math.round(items.reduce((sum, m) => sum + m.value, 0) / items.length));
      })
      .finally(() => setLoading(false));
  }, [endeavorId]);

  if (loading) return <p className="text-sm text-medium-gray">Loading health...</p>;
  if (metrics.length === 0) return null;

  const overallStatus = overallScore >= 50 ? "healthy" : overallScore >= 25 ? "warning" : "critical";

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-code-green mb-4">
        {"// project health"}
      </h3>

      {/* Overall Score */}
      <div className={`border ${statusColors[overallStatus]} p-4 mb-4 text-center`}>
        <p className="text-3xl font-bold">{overallScore}%</p>
        <p className="text-xs text-medium-gray mt-1">Overall Health Score</p>
      </div>

      {/* Individual Metrics */}
      <div className="space-y-3">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-medium-gray">{metric.label}</span>
              <span className={`text-xs font-semibold ${statusColors[metric.status].split(" ")[0]}`}>{metric.value}%</span>
            </div>
            <div className="h-1.5 bg-medium-gray/20">
              <div
                className={`h-full ${barColors[metric.status]} transition-all`}
                style={{ width: `${Math.min(100, metric.value)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
