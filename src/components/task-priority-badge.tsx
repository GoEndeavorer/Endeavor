"use client";

const priorityConfig: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  urgent: { label: "Urgent", color: "text-red-400 border-red-400/30 bg-red-400/5", icon: "!!" },
  high: { label: "High", color: "text-orange-400 border-orange-400/30 bg-orange-400/5", icon: "!" },
  medium: { label: "Medium", color: "text-yellow-400 border-yellow-400/30 bg-yellow-400/5", icon: "~" },
  low: { label: "Low", color: "text-code-blue border-code-blue/30 bg-code-blue/5", icon: "-" },
};

export function TaskPriorityBadge({ priority }: { priority: string }) {
  const config = priorityConfig[priority] || priorityConfig.medium;
  return (
    <span
      className={`inline-flex items-center gap-1 border px-1.5 py-0.5 text-[10px] font-bold uppercase ${config.color}`}
    >
      <span className="font-mono">{config.icon}</span>
      {config.label}
    </span>
  );
}
