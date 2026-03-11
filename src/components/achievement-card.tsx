"use client";

import { formatTimeAgo } from "@/lib/time";

export type AchievementCardProps = {
  name: string;
  description: string;
  icon: string;
  category: string;
  xpReward: number;
  earnedAt?: string | null;
  progress?: { current: number; threshold: number } | null;
};

const CATEGORY_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  community: { border: "border-code-blue/50", bg: "bg-code-blue/5", text: "text-code-blue" },
  contribution: { border: "border-code-green/50", bg: "bg-code-green/5", text: "text-code-green" },
  milestone: { border: "border-yellow-400/50", bg: "bg-yellow-400/5", text: "text-yellow-400" },
  skill: { border: "border-purple-400/50", bg: "bg-purple-400/5", text: "text-purple-400" },
  special: { border: "border-orange-400/50", bg: "bg-orange-400/5", text: "text-orange-400" },
};

export function AchievementCard({
  name,
  description,
  icon,
  category,
  xpReward,
  earnedAt,
  progress,
}: AchievementCardProps) {
  const isEarned = !!earnedAt;
  const colors = CATEGORY_COLORS[category] || CATEGORY_COLORS.milestone;

  return (
    <div
      className={`border p-4 transition-all ${
        isEarned
          ? `${colors.border} ${colors.bg}`
          : "border-medium-gray/10 opacity-40 grayscale"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center border font-mono text-xl font-bold ${
            isEarned
              ? `${colors.border} ${colors.text}`
              : "border-medium-gray/20 text-medium-gray/30"
          }`}
        >
          {icon}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p
              className={`font-semibold ${
                isEarned ? "text-white" : "text-medium-gray"
              }`}
            >
              {name}
            </p>
            {isEarned && (
              <span className="text-sm text-code-green">&#10003;</span>
            )}
          </div>

          <p className="text-xs text-medium-gray">{description}</p>

          {/* XP badge */}
          {xpReward > 0 && (
            <span
              className={`mt-1 inline-block text-xs font-mono ${
                isEarned ? colors.text : "text-medium-gray/40"
              }`}
            >
              +{xpReward} XP
            </span>
          )}

          {/* Earned date */}
          {isEarned && earnedAt && (
            <p className="mt-1 text-xs text-code-green">
              Earned {formatTimeAgo(earnedAt)}
            </p>
          )}

          {/* Progress bar for unearned */}
          {!isEarned && progress && progress.threshold > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-medium-gray">
                <span>
                  {progress.current} / {progress.threshold}
                </span>
                <span>
                  {Math.min(
                    100,
                    Math.round((progress.current / progress.threshold) * 100)
                  )}
                  %
                </span>
              </div>
              <div className="mt-1 h-1 w-full bg-medium-gray/20">
                <div
                  className="h-1 bg-medium-gray/40 transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((progress.current / progress.threshold) * 100)
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Category label */}
        <span
          className={`flex-shrink-0 text-xs uppercase tracking-wider ${
            isEarned ? colors.text : "text-medium-gray/30"
          }`}
        >
          {category}
        </span>
      </div>
    </div>
  );
}
