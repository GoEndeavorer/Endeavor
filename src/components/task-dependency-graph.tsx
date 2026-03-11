"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
};

type Dependency = {
  id: string;
  taskId: string;
  dependsOnId: string;
  taskTitle: string;
  taskStatus: string;
  dependsOnTitle: string;
  dependsOnStatus: string;
};

type TaskDependencyGraphProps = {
  tasks: Task[];
  endeavorId: string;
};

const STATUS_COLORS: Record<string, string> = {
  todo: "#666666",
  "in-progress": "#00A1D6",
  done: "#00FF00",
};

const STATUS_LABELS: Record<string, string> = {
  todo: "Todo",
  "in-progress": "In Progress",
  done: "Done",
};

const NODE_WIDTH = 200;
const NODE_HEIGHT = 64;
const HORIZONTAL_GAP = 60;
const VERTICAL_GAP = 80;

function computeDepthMap(
  tasks: Task[],
  dependencies: Dependency[]
): Map<string, number> {
  const depMap = new Map<string, Set<string>>();
  for (const t of tasks) {
    depMap.set(t.id, new Set());
  }
  for (const d of dependencies) {
    depMap.get(d.taskId)?.add(d.dependsOnId);
  }

  const depths = new Map<string, number>();

  function getDepth(taskId: string, visited: Set<string>): number {
    if (depths.has(taskId)) return depths.get(taskId)!;
    if (visited.has(taskId)) return 0; // circular dependency guard
    visited.add(taskId);

    const deps = depMap.get(taskId);
    if (!deps || deps.size === 0) {
      depths.set(taskId, 0);
      return 0;
    }

    let maxParentDepth = 0;
    for (const depId of deps) {
      maxParentDepth = Math.max(maxParentDepth, getDepth(depId, visited) + 1);
    }
    depths.set(taskId, maxParentDepth);
    return maxParentDepth;
  }

  for (const t of tasks) {
    getDepth(t.id, new Set());
  }

  return depths;
}

function isBlocked(taskId: string, dependencies: Dependency[]): boolean {
  return dependencies.some(
    (d) => d.taskId === taskId && d.dependsOnStatus !== "done"
  );
}

export function TaskDependencyGraph({
  tasks,
  endeavorId,
}: TaskDependencyGraphProps) {
  const [dependencies, setDependencies] = useState<Dependency[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingDep, setAddingDep] = useState(false);
  const [selectedTask, setSelectedTask] = useState("");
  const [selectedDependsOn, setSelectedDependsOn] = useState("");
  const [error, setError] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);

  const fetchDependencies = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/endeavors/${endeavorId}/task-dependencies`
      );
      if (res.ok) {
        const data = await res.json();
        setDependencies(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [endeavorId]);

  useEffect(() => {
    fetchDependencies();
  }, [fetchDependencies]);

  const handleAddDependency = async () => {
    if (!selectedTask || !selectedDependsOn) return;
    setError("");

    try {
      const res = await fetch(
        `/api/endeavors/${endeavorId}/task-dependencies`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            taskId: selectedTask,
            dependsOnId: selectedDependsOn,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to add dependency");
        return;
      }

      setSelectedTask("");
      setSelectedDependsOn("");
      setAddingDep(false);
      await fetchDependencies();
    } catch {
      setError("Failed to add dependency");
    }
  };

  const handleRemoveDependency = async (
    taskId: string,
    dependsOnId: string
  ) => {
    try {
      const res = await fetch(
        `/api/endeavors/${endeavorId}/task-dependencies`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId, dependsOnId }),
        }
      );

      if (res.ok) {
        await fetchDependencies();
      }
    } catch {
      // silently fail
    }
  };

  // Compute layout
  const depthMap = useMemo(
    () => computeDepthMap(tasks, dependencies),
    [tasks, dependencies]
  );

  const { nodePositions, svgWidth, svgHeight } = useMemo(() => {
    const levels = new Map<number, Task[]>();
    for (const t of tasks) {
      const depth = depthMap.get(t.id) ?? 0;
      if (!levels.has(depth)) levels.set(depth, []);
      levels.get(depth)!.push(t);
    }

    const maxLevel = Math.max(0, ...levels.keys());
    const positions = new Map<string, { x: number; y: number }>();

    for (let level = 0; level <= maxLevel; level++) {
      const levelTasks = levels.get(level) || [];
      const levelWidth =
        levelTasks.length * NODE_WIDTH +
        (levelTasks.length - 1) * HORIZONTAL_GAP;
      const startX = Math.max(0, (800 - levelWidth) / 2);

      levelTasks.forEach((t, i) => {
        positions.set(t.id, {
          x: startX + i * (NODE_WIDTH + HORIZONTAL_GAP),
          y: level * (NODE_HEIGHT + VERTICAL_GAP) + 20,
        });
      });
    }

    const allY = [...positions.values()].map((p) => p.y);
    const allX = [...positions.values()].map((p) => p.x);
    const computedWidth = Math.max(
      800,
      (allX.length > 0 ? Math.max(...allX) : 0) + NODE_WIDTH + 40
    );
    const computedHeight = Math.max(
      200,
      (allY.length > 0 ? Math.max(...allY) : 0) + NODE_HEIGHT + 60
    );

    return {
      nodePositions: positions,
      svgWidth: computedWidth,
      svgHeight: computedHeight,
    };
  }, [tasks, depthMap, dependencies]);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center py-12"
        style={{ color: "#666666" }}
      >
        Loading dependencies...
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div
        className="rounded-lg border border-dashed py-12 text-center"
        style={{ borderColor: "#333333", color: "#666666" }}
      >
        No tasks to visualize
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header with add button */}
      <div className="flex items-center justify-between">
        <h3
          className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: "#666666" }}
        >
          Task Dependencies
        </h3>
        {!addingDep && (
          <button
            type="button"
            onClick={() => setAddingDep(true)}
            className="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
              backgroundColor: "rgba(0,161,214,0.15)",
              color: "#00A1D6",
              border: "1px solid rgba(0,161,214,0.3)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "rgba(0,161,214,0.25)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "rgba(0,161,214,0.15)";
            }}
          >
            + Add Dependency
          </button>
        )}
      </div>

      {/* Add dependency form */}
      {addingDep && (
        <div
          className="flex flex-wrap items-end gap-3 rounded-lg p-4"
          style={{
            backgroundColor: "rgba(255,255,255,0.03)",
            border: "1px solid #333333",
          }}
        >
          <div className="flex flex-col gap-1">
            <label
              className="text-xs font-medium"
              style={{ color: "#666666" }}
            >
              Task
            </label>
            <select
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              className="rounded-md px-3 py-1.5 text-sm"
              style={{
                backgroundColor: "#1a1a1a",
                color: "#CCCCCC",
                border: "1px solid #333333",
                minWidth: "180px",
              }}
            >
              <option value="">Select task...</option>
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <span
            className="pb-1.5 text-sm font-medium"
            style={{ color: "#666666" }}
          >
            depends on
          </span>

          <div className="flex flex-col gap-1">
            <label
              className="text-xs font-medium"
              style={{ color: "#666666" }}
            >
              Dependency
            </label>
            <select
              value={selectedDependsOn}
              onChange={(e) => setSelectedDependsOn(e.target.value)}
              className="rounded-md px-3 py-1.5 text-sm"
              style={{
                backgroundColor: "#1a1a1a",
                color: "#CCCCCC",
                border: "1px solid #333333",
                minWidth: "180px",
              }}
            >
              <option value="">Select dependency...</option>
              {tasks
                .filter((t) => t.id !== selectedTask)
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddDependency}
              disabled={!selectedTask || !selectedDependsOn}
              className="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                backgroundColor: "#00A1D6",
                color: "#000000",
              }}
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => {
                setAddingDep(false);
                setSelectedTask("");
                setSelectedDependsOn("");
                setError("");
              }}
              className="cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
              style={{
                backgroundColor: "rgba(255,255,255,0.08)",
                color: "#CCCCCC",
              }}
            >
              Cancel
            </button>
          </div>

          {error && (
            <span className="w-full text-xs" style={{ color: "#ef4444" }}>
              {error}
            </span>
          )}
        </div>
      )}

      {/* Empty state */}
      {dependencies.length === 0 && !addingDep && (
        <div
          className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-12"
          style={{ borderColor: "#333333" }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            style={{ color: "#333333" }}
          >
            <path
              d="M12 16h8M28 16h8M12 32h8M28 32h8M24 20v8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <rect
              x="8"
              y="12"
              width="12"
              height="8"
              rx="2"
              stroke="currentColor"
              strokeWidth="2"
            />
            <rect
              x="28"
              y="12"
              width="12"
              height="8"
              rx="2"
              stroke="currentColor"
              strokeWidth="2"
            />
            <rect
              x="8"
              y="28"
              width="12"
              height="8"
              rx="2"
              stroke="currentColor"
              strokeWidth="2"
            />
            <rect
              x="28"
              y="28"
              width="12"
              height="8"
              rx="2"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <p className="text-sm" style={{ color: "#666666" }}>
            No dependencies defined
          </p>
          <button
            type="button"
            onClick={() => setAddingDep(true)}
            className="cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors"
            style={{
              backgroundColor: "rgba(0,255,0,0.1)",
              color: "#00FF00",
              border: "1px solid rgba(0,255,0,0.3)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "rgba(0,255,0,0.2)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                "rgba(0,255,0,0.1)";
            }}
          >
            Add first dependency
          </button>
        </div>
      )}

      {/* Dependency graph */}
      {(dependencies.length > 0 || tasks.length > 0) &&
        dependencies.length > 0 && (
          <div
            className="overflow-x-auto rounded-lg"
            style={{
              backgroundColor: "rgba(255,255,255,0.02)",
              border: "1px solid #333333",
            }}
          >
            <svg
              ref={svgRef}
              width={svgWidth}
              height={svgHeight}
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="block"
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="10"
                  markerHeight="7"
                  refX="10"
                  refY="3.5"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3.5, 0 7"
                    fill="#555555"
                  />
                </marker>
              </defs>

              {/* Connection lines with remove buttons */}
              {dependencies.map((dep) => {
                const fromPos = nodePositions.get(dep.dependsOnId);
                const toPos = nodePositions.get(dep.taskId);
                if (!fromPos || !toPos) return null;

                const x1 = fromPos.x + NODE_WIDTH / 2;
                const y1 = fromPos.y + NODE_HEIGHT;
                const x2 = toPos.x + NODE_WIDTH / 2;
                const y2 = toPos.y;

                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2;

                // Cubic bezier for smooth curves
                const cp1y = y1 + (y2 - y1) * 0.4;
                const cp2y = y1 + (y2 - y1) * 0.6;

                return (
                  <g key={dep.id}>
                    <path
                      d={`M ${x1} ${y1} C ${x1} ${cp1y}, ${x2} ${cp2y}, ${x2} ${y2}`}
                      stroke="#555555"
                      strokeWidth="2"
                      fill="none"
                      markerEnd="url(#arrowhead)"
                    />
                    {/* Remove button on the line */}
                    <g
                      className="cursor-pointer"
                      onClick={() =>
                        handleRemoveDependency(dep.taskId, dep.dependsOnId)
                      }
                    >
                      <circle
                        cx={midX}
                        cy={midY}
                        r="10"
                        fill="#1a1a1a"
                        stroke="#555555"
                        strokeWidth="1"
                      />
                      <line
                        x1={midX - 4}
                        y1={midY - 4}
                        x2={midX + 4}
                        y2={midY + 4}
                        stroke="#ef4444"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <line
                        x1={midX + 4}
                        y1={midY - 4}
                        x2={midX - 4}
                        y2={midY + 4}
                        stroke="#ef4444"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </g>
                  </g>
                );
              })}

              {/* Task nodes */}
              {tasks.map((t) => {
                const pos = nodePositions.get(t.id);
                if (!pos) return null;

                const statusColor = STATUS_COLORS[t.status] || "#666666";
                const blocked = isBlocked(t.id, dependencies);

                return (
                  <g key={t.id}>
                    {/* Node background */}
                    <rect
                      x={pos.x}
                      y={pos.y}
                      width={NODE_WIDTH}
                      height={NODE_HEIGHT}
                      rx={8}
                      fill="#1a1a1a"
                      stroke={blocked ? "#ef4444" : "#333333"}
                      strokeWidth={blocked ? 2 : 1}
                    />
                    {/* Status indicator bar */}
                    <rect
                      x={pos.x}
                      y={pos.y}
                      width={4}
                      height={NODE_HEIGHT}
                      rx={2}
                      fill={statusColor}
                    />
                    {/* Task title */}
                    <foreignObject
                      x={pos.x + 12}
                      y={pos.y + 8}
                      width={NODE_WIDTH - 24}
                      height={28}
                    >
                      <div
                        style={{
                          color: "#CCCCCC",
                          fontSize: "12px",
                          fontWeight: 500,
                          lineHeight: "14px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontFamily: "inherit",
                        }}
                        title={t.title}
                      >
                        {t.title}
                      </div>
                    </foreignObject>
                    {/* Status label */}
                    <foreignObject
                      x={pos.x + 12}
                      y={pos.y + 34}
                      width={NODE_WIDTH - 24}
                      height={24}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                      >
                        <span
                          style={{
                            display: "inline-block",
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            backgroundColor: statusColor,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            color: statusColor,
                            fontSize: "10px",
                            fontWeight: 500,
                            fontFamily: "inherit",
                          }}
                        >
                          {STATUS_LABELS[t.status] || t.status}
                        </span>
                        {blocked && (
                          <span
                            style={{
                              color: "#ef4444",
                              fontSize: "10px",
                              fontWeight: 600,
                              fontFamily: "inherit",
                            }}
                          >
                            BLOCKED
                          </span>
                        )}
                      </div>
                    </foreignObject>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

      {/* Legend */}
      {dependencies.length > 0 && (
        <div className="flex flex-wrap gap-4" style={{ color: "#666666" }}>
          <div className="flex items-center gap-2 text-xs">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: "#666666" }}
            />
            Todo
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: "#00A1D6" }}
            />
            In Progress
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: "#00FF00" }}
            />
            Done
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ border: "2px solid #ef4444" }}
            />
            Blocked
          </div>
        </div>
      )}
    </div>
  );
}
