"use client";

import { useState, useEffect } from "react";

type ContributionData = {
  endeavorsCreated: number;
  endeavorsJoined: number;
  tasksCompleted: number;
  discussionsPosts: number;
  storiesWritten: number;
  endorsementsGiven: number;
  milestonesCompleted: number;
};

export function ContributionStats({ userId }: { userId: string }) {
  const [data, setData] = useState<ContributionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${userId}/contributions`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="flex gap-3 overflow-x-auto">
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex-shrink-0 rounded-lg border border-medium-gray/20 bg-medium-gray/5 px-4 py-3 animate-pulse min-w-[100px] h-[60px]"
          />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    { value: data.endeavorsCreated, label: "Created", color: "text-code-green" },
    { value: data.endeavorsJoined, label: "Joined", color: "text-code-blue" },
    { value: data.tasksCompleted, label: "Tasks Done", color: "text-code-green" },
    { value: data.discussionsPosts, label: "Discussions", color: "text-code-blue" },
    { value: data.storiesWritten, label: "Stories", color: "text-code-green" },
    { value: data.endorsementsGiven, label: "Endorsements", color: "text-code-blue" },
    { value: data.milestonesCompleted, label: "Milestones", color: "text-code-green" },
  ];

  return (
    <div className="flex gap-3 overflow-x-auto">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex-shrink-0 rounded-lg border border-medium-gray/20 bg-medium-gray/5 px-4 py-3 text-center min-w-[100px]"
        >
          <p className={`text-lg font-bold font-mono ${stat.color}`}>
            {stat.value.toLocaleString()}
          </p>
          <p className="text-[10px] text-medium-gray uppercase tracking-wider">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
