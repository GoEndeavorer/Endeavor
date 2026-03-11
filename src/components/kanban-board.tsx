"use client";

import { useState } from "react";

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  assigneeId: string | null;
  assigneeName: string | null;
};

type KanbanBoardProps = {
  tasks: Task[];
  onStatusChange: (taskId: string, newStatus: string) => void;
};

const COLUMNS = [
  { key: "todo", label: "Todo", color: "#00A1D6" },
  { key: "in-progress", label: "In Progress", color: "#00FF00" },
  { key: "done", label: "Done", color: "#666666" },
] as const;

const STATUS_CYCLE: Record<string, string> = {
  todo: "in-progress",
  "in-progress": "done",
  done: "todo",
};

const PRIORITY_COLORS: Record<string, { bg: string; text: string }> = {
  urgent: { bg: "rgba(239,68,68,0.2)", text: "#ef4444" },
  high: { bg: "rgba(249,115,22,0.2)", text: "#f97316" },
  medium: { bg: "rgba(234,179,8,0.2)", text: "#eab308" },
  low: { bg: "rgba(34,197,94,0.2)", text: "#22c55e" },
};

function PriorityBadge({ priority }: { priority: string }) {
  const colors = PRIORITY_COLORS[priority] || PRIORITY_COLORS.medium;
  return (
    <span
      style={{ backgroundColor: colors.bg, color: colors.text }}
      className="inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize"
    >
      {priority}
    </span>
  );
}

function TaskCard({
  task,
  onStatusChange,
}: {
  task: Task;
  onStatusChange: (taskId: string, newStatus: string) => void;
}) {
  const [pressed, setPressed] = useState(false);

  function handleClick() {
    const next = STATUS_CYCLE[task.status] || "todo";
    setPressed(true);
    onStatusChange(task.id, next);
    setTimeout(() => setPressed(false), 200);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full cursor-pointer text-left"
      style={{
        backgroundColor: pressed ? "#333333" : "#1a1a1a",
        border: "1px solid #333333",
        borderRadius: "8px",
        padding: "12px",
        transition: "all 200ms ease",
        transform: pressed ? "scale(0.97)" : "scale(1)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "#555555";
        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
          "#222222";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "#333333";
        (e.currentTarget as HTMLButtonElement).style.backgroundColor =
          "#1a1a1a";
      }}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span
          className="text-sm font-medium leading-snug"
          style={{ color: "#CCCCCC" }}
        >
          {task.title}
        </span>
        <PriorityBadge priority={task.priority} />
      </div>
      {task.assigneeName && (
        <div className="flex items-center gap-1.5">
          <span
            className="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold"
            style={{ backgroundColor: "#333333", color: "#CCCCCC" }}
          >
            {task.assigneeName.charAt(0).toUpperCase()}
          </span>
          <span className="text-xs" style={{ color: "#666666" }}>
            {task.assigneeName}
          </span>
        </div>
      )}
    </button>
  );
}

export function KanbanBoard({ tasks, onStatusChange }: KanbanBoardProps) {
  const grouped = COLUMNS.map((col) => ({
    ...col,
    tasks: tasks.filter((t) => t.status === col.key),
  }));

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {grouped.map((column) => (
        <div key={column.key} className="flex flex-col gap-3">
          {/* Column header */}
          <div
            className="flex items-center justify-between rounded-lg px-3 py-2"
            style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
          >
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: column.color }}
              />
              <span
                className="text-sm font-semibold"
                style={{ color: "#CCCCCC" }}
              >
                {column.label}
              </span>
            </div>
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{
                backgroundColor: "rgba(255,255,255,0.08)",
                color: "#666666",
              }}
            >
              {column.tasks.length}
            </span>
          </div>

          {/* Cards */}
          <div className="flex flex-col gap-2">
            {column.tasks.length === 0 ? (
              <div
                className="rounded-lg border border-dashed py-8 text-center text-xs"
                style={{ borderColor: "#333333", color: "#666666" }}
              >
                No tasks
              </div>
            ) : (
              column.tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={onStatusChange}
                />
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
