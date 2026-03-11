"use client";

import { useState } from "react";
import { useToast } from "@/components/toast";

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string | null;
  dueDate: string | null;
  assigneeName: string | null;
};

type Column = {
  key: string;
  label: string;
  color: string;
};

const columns: Column[] = [
  { key: "todo", label: "To Do", color: "text-yellow-400" },
  { key: "in-progress", label: "In Progress", color: "text-code-blue" },
  { key: "completed", label: "Done", color: "text-code-green" },
];

export function TaskBoard({
  endeavorId,
  tasks: initialTasks,
}: {
  endeavorId: string;
  tasks: Task[];
}) {
  const { toast } = useToast();
  const [tasks, setTasks] = useState(initialTasks);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  function getTasksForColumn(status: string) {
    return tasks.filter((t) => t.status === status);
  }

  async function moveTask(taskId: string, newStatus: string) {
    const prevTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      const res = await fetch(`/api/endeavors/${endeavorId}/tasks`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast("Task updated");
    } catch {
      setTasks(prevTasks);
      toast("Failed to update task", "error");
    }
  }

  function handleDragStart(taskId: string) {
    setDraggedTask(taskId);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(e: React.DragEvent, status: string) {
    e.preventDefault();
    if (draggedTask) {
      moveTask(draggedTask, status);
      setDraggedTask(null);
    }
  }

  const priorityColors: Record<string, string> = {
    high: "text-red-400",
    medium: "text-yellow-400",
    low: "text-medium-gray",
  };

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {columns.map((col) => (
        <div
          key={col.key}
          className="border border-medium-gray/20 min-h-[200px]"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, col.key)}
        >
          <div className="border-b border-medium-gray/20 px-3 py-2 flex items-center justify-between">
            <span className={`text-xs font-semibold uppercase tracking-widest ${col.color}`}>
              {"// "}{col.label}
            </span>
            <span className="text-xs font-mono text-medium-gray">
              {getTasksForColumn(col.key).length}
            </span>
          </div>
          <div className="p-2 space-y-1">
            {getTasksForColumn(col.key).map((task) => (
              <div
                key={task.id}
                draggable
                onDragStart={() => handleDragStart(task.id)}
                className={`border border-medium-gray/10 p-3 cursor-grab active:cursor-grabbing transition-colors hover:border-medium-gray/30 ${
                  draggedTask === task.id ? "opacity-50" : ""
                }`}
              >
                <p className="text-sm font-semibold truncate">{task.title}</p>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  {task.priority && (
                    <span className={`font-mono ${priorityColors[task.priority] || "text-medium-gray"}`}>
                      {task.priority}
                    </span>
                  )}
                  {task.assigneeName && (
                    <span className="text-medium-gray">@{task.assigneeName}</span>
                  )}
                  {task.dueDate && (
                    <span className="text-medium-gray ml-auto">
                      {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {getTasksForColumn(col.key).length === 0 && (
              <p className="text-xs text-medium-gray/50 text-center py-8">
                Drop tasks here
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
