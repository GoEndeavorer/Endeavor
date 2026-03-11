"use client";

type ConfirmationDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmationDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onCancel}>
      <div className="mx-4 w-full max-w-md border border-medium-gray/30 bg-black p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-sm font-bold text-light-gray mb-2">{title}</h3>
        <p className="text-xs text-medium-gray mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold border border-medium-gray/30 text-medium-gray hover:text-light-gray transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-semibold border transition-colors ${
              danger
                ? "border-red-400 text-red-400 hover:bg-red-400 hover:text-black"
                : "border-code-green text-code-green hover:bg-code-green hover:text-black"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
