"use client";

import { useState, useEffect } from "react";

type DayData = { date: string; count: number };

export function ContributionGraph({ userId }: { userId: string }) {
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${userId}/contribution-graph`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.days) setData(d.days);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading || data.length === 0) return null;

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const weeks: DayData[][] = [];
  let currentWeek: DayData[] = [];

  for (const day of data) {
    const dayOfWeek = new Date(day.date).getDay();
    if (dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  function getIntensity(count: number): string {
    if (count === 0) return "bg-medium-gray/10";
    const ratio = count / maxCount;
    if (ratio <= 0.25) return "bg-code-green/20";
    if (ratio <= 0.5) return "bg-code-green/40";
    if (ratio <= 0.75) return "bg-code-green/60";
    return "bg-code-green";
  }

  const totalContributions = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="border border-medium-gray/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// contributions"}
        </h4>
        <span className="text-xs text-medium-gray font-mono">
          {totalContributions} total
        </span>
      </div>
      <div className="flex gap-[2px] overflow-x-auto scrollbar-none">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[2px]">
            {week.map((day) => (
              <div
                key={day.date}
                className={`h-2.5 w-2.5 ${getIntensity(day.count)}`}
                title={`${day.date}: ${day.count} contributions`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-2 flex items-center gap-1 justify-end">
        <span className="text-[10px] text-medium-gray mr-1">Less</span>
        <div className="h-2 w-2 bg-medium-gray/10" />
        <div className="h-2 w-2 bg-code-green/20" />
        <div className="h-2 w-2 bg-code-green/40" />
        <div className="h-2 w-2 bg-code-green/60" />
        <div className="h-2 w-2 bg-code-green" />
        <span className="text-[10px] text-medium-gray ml-1">More</span>
      </div>
    </div>
  );
}
