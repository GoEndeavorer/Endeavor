"use client";

type BulkAction = {
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
};

export function BulkActionBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  actions,
}: {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  actions: BulkAction[];
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="sticky top-16 z-30 border border-code-green/30 bg-code-green/5 px-4 py-2.5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="text-xs text-code-green font-mono">
          {selectedCount} selected
        </span>
        {selectedCount < totalCount ? (
          <button
            onClick={onSelectAll}
            className="text-xs text-code-blue hover:text-code-green transition-colors"
          >
            Select all {totalCount}
          </button>
        ) : (
          <button
            onClick={onClearSelection}
            className="text-xs text-medium-gray hover:text-code-green transition-colors"
          >
            Clear selection
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            disabled={action.disabled}
            className={`border px-3 py-1 text-xs font-bold uppercase transition-colors disabled:opacity-50 ${
              action.variant === "danger"
                ? "border-red-400/30 text-red-400 hover:bg-red-400/10"
                : "border-code-green/30 text-code-green hover:bg-code-green/10"
            }`}
          >
            {action.label}
          </button>
        ))}
        <button
          onClick={onClearSelection}
          className="text-xs text-medium-gray hover:text-white ml-2"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
