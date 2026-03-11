"use client";

import { useMemo } from "react";

type GanttTask = {
  id: string;
  title: string;
  status: string;
  startDate: string | null;
  dueDate: string | null;
  assigneeName: string | null;
};

const statusColors: Record<string, string> = {
  todo: "bg-yellow-400/30 border-yellow-400/50",
  "in-progress": "bg-code-blue/30 border-code-blue/50",
  completed: "bg-code-green/30 border-code-green/50",
};

export function GanttChart({ tasks }: { tasks: GanttTask[] }) {
  const { tasksWithDates, startDate, endDate, totalDays } = useMemo(() => {
    const withDates = tasks.filter((t) => t.startDate || t.dueDate);
    if (withDates.length === 0) {
      return { tasksWithDates: [], startDate: new Date(), endDate: new Date(), totalDays: 1 };
    }

    const allDates = withDates.flatMap((t) => [
      t.startDate ? new Date(t.startDate) : null,
      t.dueDate ? new Date(t.dueDate) : null,
    ]).filter(Boolean) as Date[];

    const min = new Date(Math.min(...allDates.map((d) => d.getTime())));
    const max = new Date(Math.max(...allDates.map((d) => d.getTime())));

    // Add padding
    min.setDate(min.getDate() - 2);
    max.setDate(max.getDate() + 2);

    const days = Math.max(Math.ceil((max.getTime() - min.getTime()) / (1000 * 60 * 60 * 24)), 7);

    return { tasksWithDates: withDates, startDate: min, endDate: max, totalDays: days };
  }, [tasks]);

  if (tasksWithDates.length === 0) {
    return (
      <div className="border border-medium-gray/20 p-6 text-center">
        <p className="text-xs text-medium-gray">No tasks with dates to display on timeline.</p>
      </div>
    );
  }

  function getPosition(date: string): number {
    const d = new Date(date);
    const diff = d.getTime() - startDate.getTime();
    return (diff / (totalDays * 24 * 60 * 60 * 1000)) * 100;
  }

  function getWidth(start: string, end: string): number {
    const s = new Date(start);
    const e = new Date(end);
    const diff = e.getTime() - s.getTime();
    return Math.max((diff / (totalDays * 24 * 60 * 60 * 1000)) * 100, 2);
  }

  // Generate month labels
  const months: { label: string; left: number }[] = [];
  const cursor = new Date(startDate);
  cursor.setDate(1);
  while (cursor <= endDate) {
    const left = getPosition(cursor.toISOString());
    if (left >= 0 && left <= 100) {
      months.push({
        label: cursor.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
        left,
      });
    }
    cursor.setMonth(cursor.getMonth() + 1);
  }

  return (
    <div className="border border-medium-gray/20">
      <div className="border-b border-medium-gray/20 px-3 py-2">
        <h4 className="text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// timeline"}
        </h4>
      </div>

      {/* Month labels */}
      <div className="relative h-6 border-b border-medium-gray/10 bg-medium-gray/5">
        {months.map((m, i) => (
          <span
            key={i}
            className="absolute text-[10px] text-medium-gray font-mono top-1"
            style={{ left: `${m.left}%` }}
          >
            {m.label}
          </span>
        ))}
      </div>

      {/* Task bars */}
      <div className="divide-y divide-medium-gray/10">
        {tasksWithDates.map((task) => {
          const taskStart = task.startDate || task.dueDate!;
          const taskEnd = task.dueDate || task.startDate!;
          const left = getPosition(taskStart);
          const width = getWidth(taskStart, taskEnd);

          return (
            <div key={task.id} className="flex items-center h-8 relative group">
              <div className="absolute inset-0 px-2 flex items-center">
                <div
                  className={`h-4 border rounded-sm ${statusColors[task.status] || "bg-medium-gray/20 border-medium-gray/30"}`}
                  style={{ marginLeft: `${left}%`, width: `${Math.max(width, 1)}%` }}
                  title={`${task.title} (${task.status})`}
                />
              </div>
              <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 border border-medium-gray/30 px-2 py-1 z-10 pointer-events-none">
                <p className="text-xs font-semibold text-light-gray whitespace-nowrap">{task.title}</p>
                <p className="text-[10px] text-medium-gray">
                  {task.status} {task.assigneeName && `· @${task.assigneeName}`}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
