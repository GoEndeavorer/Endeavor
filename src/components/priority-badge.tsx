"use client";

type PriorityBadgeProps = {
  priority: string;
  size?: "sm" | "md";
};

const colors: Record<string, string> = {
  urgent: "border-red-400 text-red-400 bg-red-400/10",
  high: "border-yellow-400 text-yellow-400 bg-yellow-400/10",
  medium: "border-code-blue text-code-blue bg-code-blue/10",
  low: "border-medium-gray text-medium-gray bg-medium-gray/10",
};

export function PriorityBadge({ priority, size = "sm" }: PriorityBadgeProps) {
  const cls = colors[priority] || colors.medium;
  const sizeClasses = size === "sm" ? "px-1.5 py-0.5 text-xs" : "px-2 py-1 text-sm";

  return (
    <span className={`border ${cls} ${sizeClasses} font-semibold capitalize`}>
      {priority}
    </span>
  );
}
