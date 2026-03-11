const statusConfig: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  open: {
    label: "Open",
    color: "text-code-green border-code-green/30 bg-code-green/5",
    icon: "o",
  },
  "in-progress": {
    label: "In Progress",
    color: "text-code-blue border-code-blue/30 bg-code-blue/5",
    icon: "~",
  },
  completed: {
    label: "Completed",
    color: "text-green-400 border-green-400/30 bg-green-400/5",
    icon: "*",
  },
  draft: {
    label: "Draft",
    color: "text-medium-gray border-medium-gray/30 bg-medium-gray/5",
    icon: ".",
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-400 border-red-400/30 bg-red-400/5",
    icon: "x",
  },
};

export function StatusBadge({
  status,
  size = "sm",
}: {
  status: string;
  size?: "xs" | "sm";
}) {
  const config = statusConfig[status] || statusConfig.draft;
  const textSize = size === "xs" ? "text-[10px]" : "text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1 border px-1.5 py-0.5 font-bold uppercase ${textSize} ${config.color}`}
    >
      <span className="font-mono">{config.icon}</span>
      {config.label}
    </span>
  );
}
