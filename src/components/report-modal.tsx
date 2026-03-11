"use client";

import { useState } from "react";
import { useToast } from "@/components/toast";

type ReportModalProps = {
  targetType: "endeavor" | "user" | "discussion" | "story";
  targetId: string;
  onClose: () => void;
};

const REASONS = [
  { value: "spam", label: "Spam or misleading" },
  { value: "harassment", label: "Harassment or bullying" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "scam", label: "Scam or fraud" },
  { value: "other", label: "Other" },
];

export function ReportModal({ targetType, targetId, onClose }: ReportModalProps) {
  const { toast } = useToast();
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason) return;

    setSubmitting(true);
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType, targetId, reason, description }),
    });

    if (res.ok) {
      toast("Report submitted. Thank you.");
      onClose();
    } else {
      toast("Failed to submit report", "error");
    }
    setSubmitting(false);
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 px-4">
      <div className="w-full max-w-md border border-medium-gray/30 bg-black p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Report {targetType}</h2>
          <button onClick={onClose} className="text-medium-gray hover:text-white">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="mb-2 text-xs text-medium-gray uppercase tracking-wider">Reason</p>
            <div className="space-y-1">
              {REASONS.map((r) => (
                <label
                  key={r.value}
                  className={`flex cursor-pointer items-center gap-3 border p-3 transition-colors ${
                    reason === r.value
                      ? "border-code-green/50 bg-code-green/5"
                      : "border-medium-gray/20 hover:border-medium-gray/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                    className="accent-code-green"
                  />
                  <span className="text-sm">{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs text-medium-gray uppercase tracking-wider">
              Additional details (optional)
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more context..."
              rows={3}
              maxLength={500}
              className="w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green resize-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!reason || submitting}
              className="flex-1 border border-red-400 px-4 py-3 text-xs font-bold uppercase text-red-400 transition-colors hover:bg-red-400 hover:text-black disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 text-xs text-medium-gray hover:text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
