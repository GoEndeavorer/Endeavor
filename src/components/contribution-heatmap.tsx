"use client";

import { useState, useEffect } from "react";

type DayData = {
  date: string;
  count: number;
};

export function ContributionHeatmap({ userId }: { userId: string }) {
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/contributions?userId=${userId}`)
      .then((r) => r.ok ? r.json() : [])
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading || data.length === 0) return null;

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  function getColor(count: number): string {
    if (count === 0) return "bg-medium-gray/10";
    const intensity = count / maxCount;
    if (intensity > 0.75) return "bg-code-green";
    if (intensity > 0.5) return "bg-code-green/70";
    if (intensity > 0.25) return "bg-code-green/40";
    return "bg-code-green/20";
  }

  // Show last 12 weeks (84 days)
  const last84 = data.slice(-84);
  const weeks: DayData[][] = [];
  for (let i = 0; i < last84.length; i += 7) {
    weeks.push(last84.slice(i, i + 7));
  }

  const totalContributions = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// contributions"}
        </h3>
        <span className="text-xs text-medium-gray">
          {totalContributions} total
        </span>
      </div>
      <div className="flex gap-0.5 overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} contributions`}
                className={`h-3 w-3 ${getColor(day.count)}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-1 flex items-center gap-1 justify-end">
        <span className="text-[10px] text-medium-gray">Less</span>
        <div className="h-3 w-3 bg-medium-gray/10" />
        <div className="h-3 w-3 bg-code-green/20" />
        <div className="h-3 w-3 bg-code-green/40" />
        <div className="h-3 w-3 bg-code-green/70" />
        <div className="h-3 w-3 bg-code-green" />
        <span className="text-[10px] text-medium-gray">More</span>
      </div>
    </div>
  );
}
