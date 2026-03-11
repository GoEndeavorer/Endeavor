"use client";

import { useState, useEffect } from "react";

type TrustLevel = "new" | "basic" | "trusted" | "established" | "pillar";

type ReputationBreakdown = {
  accountAge: number;
  profileCompleteness: number;
  endorsementsReceived: number;
  completedEndeavors: number;
  publishedStories: number;
  discussionCount: number;
  verifiedSkills: number;
  mentorshipCompletions: number;
};

type ReputationData = {
  score: number;
  trustLevel: TrustLevel;
  breakdown: ReputationBreakdown;
};

const trustLevelColors: Record<TrustLevel, string> = {
  new: "text-medium-gray",
  basic: "text-code-blue",
  trusted: "text-code-green",
  established: "text-purple-400",
  pillar: "text-yellow-400",
};

const breakdownLabels: Record<keyof ReputationBreakdown, { label: string; max: number }> = {
  accountAge: { label: "Account Age", max: 15 },
  profileCompleteness: { label: "Profile", max: 15 },
  endorsementsReceived: { label: "Endorsements", max: 15 },
  completedEndeavors: { label: "Completed", max: 15 },
  publishedStories: { label: "Stories", max: 10 },
  discussionCount: { label: "Discussions", max: 10 },
  verifiedSkills: { label: "Skills", max: 10 },
  mentorshipCompletions: { label: "Mentorship", max: 10 },
};

export function ReputationCard({ userId }: { userId: string }) {
  const [data, setData] = useState<ReputationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${userId}/reputation`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="border border-medium-gray/20 p-4 animate-pulse">
        <div className="h-4 w-32 bg-medium-gray/10 mb-4" />
        <div className="h-2 w-full bg-medium-gray/10 mb-6" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-3 w-full bg-medium-gray/10" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const levelColor = trustLevelColors[data.trustLevel] || trustLevelColors.new;

  return (
    <div className="border border-medium-gray/20 p-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-code-green mb-4">
        {"// reputation"}
      </p>

      {/* Score + Trust Level */}
      <div className="flex items-baseline justify-between mb-2">
        <span className="font-mono text-2xl font-bold text-light-gray">
          {data.score}
        </span>
        <span className={`text-xs font-bold uppercase tracking-wider ${levelColor}`}>
          {data.trustLevel}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 w-full bg-medium-gray/10 mb-6">
        <div
          className={`h-full transition-all duration-500 ${
            data.trustLevel === "pillar"
              ? "bg-yellow-400"
              : data.trustLevel === "established"
              ? "bg-purple-400"
              : data.trustLevel === "trusted"
              ? "bg-code-green"
              : data.trustLevel === "basic"
              ? "bg-code-blue"
              : "bg-medium-gray"
          }`}
          style={{ width: `${data.score}%` }}
        />
      </div>

      {/* Breakdown */}
      <div className="space-y-3">
        {(Object.keys(breakdownLabels) as (keyof ReputationBreakdown)[]).map(
          (key) => {
            const { label, max } = breakdownLabels[key];
            const value = data.breakdown[key];
            const pct = max > 0 ? (value / max) * 100 : 0;

            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase tracking-wider text-medium-gray">
                    {label}
                  </span>
                  <span className="font-mono text-[10px] text-light-gray">
                    {value}/{max}
                  </span>
                </div>
                <div className="h-1 w-full bg-medium-gray/10">
                  <div
                    className="h-full bg-code-green/60 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}
