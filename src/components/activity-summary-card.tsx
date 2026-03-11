"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Summary = {
  period: number;
  contributions: {
    discussions: number;
    tasks_completed: number;
    stories: number;
    endorsements_given: number;
    endorsements_received: number;
  };
  streak: number;
  topEndeavors: { id: string; title: string; activity_count: number }[];
  activeDays: number;
};

export function ActivitySummaryCard({ userId }: { userId: string }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [period, setPeriod] = useState(7);

  useEffect(() => {
    fetch(`/api/users/${userId}/activity-summary?days=${period}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setSummary)
      .catch(() => {});
  }, [userId, period]);

  if (!summary) return null;

  const c = summary.contributions;
  const totalActivity =
    Number(c.discussions) + Number(c.tasks_completed) + Number(c.stories) + Number(c.endorsements_given);

  if (totalActivity === 0 && summary.streak === 0) return null;

  return (
    <div className="border border-medium-gray/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// activity summary"}
        </h4>
        <div className="flex gap-1">
          {[7, 30].map((d) => (
            <button
              key={d}
              onClick={() => setPeriod(d)}
              className={`px-2 py-0.5 text-xs transition-colors ${
                period === d
                  ? "text-code-green bg-code-green/10"
                  : "text-medium-gray hover:text-white"
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Streak */}
      {summary.streak > 0 && (
        <div className="mb-3 flex items-center gap-2">
          <span className="text-yellow-400 text-lg font-bold">{summary.streak}</span>
          <span className="text-xs text-medium-gray">day streak</span>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {Number(c.discussions) > 0 && (
          <div className="text-center">
            <p className="text-sm font-bold text-code-blue">{Number(c.discussions)}</p>
            <p className="text-xs text-medium-gray">posts</p>
          </div>
        )}
        {Number(c.tasks_completed) > 0 && (
          <div className="text-center">
            <p className="text-sm font-bold text-code-green">{Number(c.tasks_completed)}</p>
            <p className="text-xs text-medium-gray">tasks</p>
          </div>
        )}
        {Number(c.stories) > 0 && (
          <div className="text-center">
            <p className="text-sm font-bold text-purple-400">{Number(c.stories)}</p>
            <p className="text-xs text-medium-gray">stories</p>
          </div>
        )}
        {Number(c.endorsements_received) > 0 && (
          <div className="text-center">
            <p className="text-sm font-bold text-yellow-400">{Number(c.endorsements_received)}</p>
            <p className="text-xs text-medium-gray">endorsed</p>
          </div>
        )}
      </div>

      {/* Top endeavors */}
      {summary.topEndeavors.length > 0 && (
        <div>
          <p className="text-xs text-medium-gray mb-1">Most active in:</p>
          {summary.topEndeavors.slice(0, 3).map((e) => (
            <Link
              key={e.id}
              href={`/endeavors/${e.id}`}
              className="block text-xs text-code-blue hover:text-code-green truncate"
            >
              {e.title} ({Number(e.activity_count)} actions)
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
