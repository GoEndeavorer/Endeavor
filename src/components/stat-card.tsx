type StatCardProps = {
  label: string;
  value: number | string;
  change?: number;
  color?: string;
};

export function StatCard({
  label,
  value,
  change,
  color = "text-code-green",
}: StatCardProps) {
  return (
    <div className="border border-medium-gray/20 p-4">
      <p className="text-xs text-medium-gray mb-1">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
      {change !== undefined && (
        <p
          className={`mt-1 text-xs ${
            change > 0
              ? "text-code-green"
              : change < 0
              ? "text-red-400"
              : "text-medium-gray"
          }`}
        >
          {change > 0 ? "+" : ""}
          {change} this week
        </p>
      )}
    </div>
  );
}
