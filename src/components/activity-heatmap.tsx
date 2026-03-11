"use client";

import { useEffect, useState, useCallback } from "react";

interface DayData {
  date: string;
  count: number;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  date: string;
  count: number;
}

function getColorClass(count: number): string {
  if (count === 0) return "bg-white/[0.04]";
  if (count === 1) return "bg-[#00FF00]/25";
  if (count <= 3) return "bg-[#00FF00]/50";
  return "bg-[#00FF00]/90";
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const DAY_LABELS: { label: string; row: number }[] = [
  { label: "M", row: 1 },
  { label: "W", row: 3 },
  { label: "F", row: 5 },
];

function buildGrid(activityMap: Map<string, number>) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find the most recent Sunday (end of grid)
  const endDate = new Date(today);

  // Start 52 weeks before the end of the current week
  // We want 53 columns worth of days to fill 52 full weeks + partial
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 363); // 52 weeks * 7 = 364, minus 1

  // Align startDate to the previous Monday (row 0 = Monday)
  const startDay = startDate.getDay(); // 0=Sun, 1=Mon, ...
  const mondayOffset = startDay === 0 ? -6 : 1 - startDay;
  startDate.setDate(startDate.getDate() + mondayOffset);

  const weeks: { date: string; count: number; dayOfWeek: number }[][] = [];
  const monthStarts: { weekIndex: number; month: number }[] = [];

  let currentDate = new Date(startDate);
  let currentWeek: { date: string; count: number; dayOfWeek: number }[] = [];
  let lastMonth = -1;

  while (currentDate <= today) {
    // dayOfWeek: 0=Mon, 1=Tue, ..., 6=Sun
    const jsDay = currentDate.getDay();
    const dayOfWeek = jsDay === 0 ? 6 : jsDay - 1;

    const dateStr = currentDate.toISOString().slice(0, 10);
    const count = activityMap.get(dateStr) || 0;

    // Track month transitions
    const month = currentDate.getMonth();
    if (month !== lastMonth) {
      monthStarts.push({ weekIndex: weeks.length, month });
      lastMonth = month;
    }

    currentWeek.push({ date: dateStr, count, dayOfWeek });

    // End of week (Sunday) — push and start new week
    if (dayOfWeek === 6) {
      weeks.push(currentWeek);
      currentWeek = [];
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Push any remaining partial week
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  return { weeks, monthStarts };
}

export default function ActivityHeatmap({ userId }: { userId: string }) {
  const [data, setData] = useState<DayData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<TooltipState>({
    visible: false,
    x: 0,
    y: 0,
    date: "",
    count: 0,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/users/${userId}/heatmap`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          setData([]);
        }
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId]);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent, date: string, count: number) => {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setTooltip({
        visible: true,
        x: rect.left + rect.width / 2,
        y: rect.top - 8,
        date,
        count,
      });
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border border-white/10 bg-black/40 p-6">
        <div className="mb-4 h-5 w-48 animate-pulse rounded bg-white/10" />
        <div className="grid grid-cols-[auto_1fr] gap-2">
          <div className="w-4" />
          <div className="h-[104px] animate-pulse rounded bg-white/5" />
        </div>
      </div>
    );
  }

  const activityMap = new Map<string, number>();
  let totalCount = 0;
  if (data) {
    for (const d of data) {
      activityMap.set(d.date, d.count);
      totalCount += d.count;
    }
  }

  const { weeks, monthStarts } = buildGrid(activityMap);
  const cellSize = 13;
  const cellGap = 3;
  const step = cellSize + cellGap;

  return (
    <div className="rounded-lg border border-white/10 bg-black/40 p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="font-mono text-sm font-medium text-[#CCCCCC]">
          Activity
        </h3>
        <span className="font-mono text-xs text-[#666666]">
          {totalCount} contributions in the last year
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block">
          {/* Month labels */}
          <div
            className="flex text-[10px] text-[#666666] font-mono"
            style={{ paddingLeft: 28 }}
          >
            {monthStarts.map((ms, i) => {
              const nextStart =
                i + 1 < monthStarts.length
                  ? monthStarts[i + 1].weekIndex
                  : weeks.length;
              const span = nextStart - ms.weekIndex;
              if (span < 2) return null;
              return (
                <span
                  key={`${ms.month}-${ms.weekIndex}`}
                  style={{
                    position: "relative",
                    left: ms.weekIndex * step,
                    width: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  {MONTH_LABELS[ms.month]}
                </span>
              );
            })}
          </div>

          {/* Grid */}
          <div className="mt-1 flex gap-0">
            {/* Day labels */}
            <div
              className="flex flex-col font-mono text-[10px] text-[#666666]"
              style={{ width: 24, flexShrink: 0 }}
            >
              {Array.from({ length: 7 }).map((_, row) => {
                const dayLabel = DAY_LABELS.find((d) => d.row === row);
                return (
                  <div
                    key={row}
                    style={{
                      height: cellSize,
                      marginBottom: cellGap,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    {dayLabel?.label ?? ""}
                  </div>
                );
              })}
            </div>

            {/* Cells */}
            <div className="flex gap-[3px]">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {Array.from({ length: 7 }).map((_, row) => {
                    const cell = week.find((c) => c.dayOfWeek === row);
                    if (!cell) {
                      return (
                        <div
                          key={row}
                          style={{ width: cellSize, height: cellSize }}
                        />
                      );
                    }
                    return (
                      <div
                        key={row}
                        className={`rounded-sm ${getColorClass(cell.count)} transition-colors hover:ring-1 hover:ring-[#00FF00]/40`}
                        style={{ width: cellSize, height: cellSize }}
                        onMouseEnter={(e) =>
                          handleMouseEnter(e, cell.date, cell.count)
                        }
                        onMouseLeave={handleMouseLeave}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center justify-end gap-1 font-mono text-[10px] text-[#666666]">
            <span className="mr-1">Less</span>
            <div
              className="rounded-sm bg-white/[0.04]"
              style={{ width: cellSize, height: cellSize }}
            />
            <div
              className="rounded-sm bg-[#00FF00]/25"
              style={{ width: cellSize, height: cellSize }}
            />
            <div
              className="rounded-sm bg-[#00FF00]/50"
              style={{ width: cellSize, height: cellSize }}
            />
            <div
              className="rounded-sm bg-[#00FF00]/90"
              style={{ width: cellSize, height: cellSize }}
            />
            <span className="ml-1">More</span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip.visible && (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-full rounded border border-white/10 bg-black/90 px-2.5 py-1.5 font-mono text-xs text-[#CCCCCC] shadow-lg"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <span className="font-medium text-[#00FF00]">{tooltip.count}</span>
          {" "}
          {tooltip.count === 1 ? "contribution" : "contributions"} on{" "}
          {formatDate(tooltip.date)}
        </div>
      )}
    </div>
  );
}
