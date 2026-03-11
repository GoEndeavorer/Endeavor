"use client";

import { useState, useEffect } from "react";

type DayData = {
  date: string;
  count: number;
};

export function EndeavorActivityHeatmap({ endeavorId }: { endeavorId: string }) {
  const [data, setData] = useState<DayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/activity-heatmap`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setData(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [endeavorId]);

  if (loading) {
    return <div className="h-20 animate-pulse bg-medium-gray/10" />;
  }

  if (data.length === 0) return null;

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  function getColor(count: number): string {
    if (count === 0) return "bg-medium-gray/10";
    const ratio = count / maxCount;
    if (ratio > 0.75) return "bg-code-green";
    if (ratio > 0.5) return "bg-code-green/70";
    if (ratio > 0.25) return "bg-code-green/40";
    return "bg-code-green/20";
  }

  // Show last 12 weeks (84 days)
  const today = new Date();
  const days: { date: string; count: number }[] = [];
  const dataMap = new Map(data.map((d) => [d.date, d.count]));

  for (let i = 83; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().split("T")[0];
    days.push({ date: key, count: dataMap.get(key) || 0 });
  }

  // Arrange into weeks (columns) of 7 days
  const weeks: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-code-green">
        {"// activity"}
      </h3>
      <div className="flex gap-0.5">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {week.map((day) => (
              <div
                key={day.date}
                className={`h-2.5 w-2.5 ${getColor(day.count)}`}
                title={`${day.date}: ${day.count} activities`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-1 flex items-center justify-end gap-1">
        <span className="text-[9px] text-medium-gray">Less</span>
        <div className="h-2 w-2 bg-medium-gray/10" />
        <div className="h-2 w-2 bg-code-green/20" />
        <div className="h-2 w-2 bg-code-green/40" />
        <div className="h-2 w-2 bg-code-green/70" />
        <div className="h-2 w-2 bg-code-green" />
        <span className="text-[9px] text-medium-gray">More</span>
      </div>
    </div>
  );
}
