"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/toast";

type Endeavor = {
  id: string;
  title: string;
};

export function QuickTaskModal({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const [endeavors, setEndeavors] = useState<Endeavor[]>([]);
  const [selectedEndeavor, setSelectedEndeavor] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.endeavors) {
          setEndeavors(
            data.endeavors
              .filter((e: { status: string }) => e.status !== "completed" && e.status !== "cancelled")
              .map((e: { id: string; title: string }) => ({
                id: e.id,
                title: e.title,
              }))
          );
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !selectedEndeavor) return;

    setCreating(true);
    try {
      const res = await fetch(`/api/endeavors/${selectedEndeavor}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          dueDate: dueDate || undefined,
        }),
      });

      if (res.ok) {
        toast("Task created");
        onClose();
      } else {
        toast("Failed to create task", "error");
      }
    } catch {
      toast("Something went wrong", "error");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md border border-medium-gray/30 bg-black p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// quick task"}
          </h3>
          <button
            onClick={onClose}
            className="text-xs text-medium-gray hover:text-white"
          >
            ESC
          </button>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-medium-gray animate-pulse">
            Loading...
          </p>
        ) : endeavors.length === 0 ? (
          <p className="py-8 text-center text-sm text-medium-gray">
            Join an endeavor first to create tasks.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <select
              value={selectedEndeavor}
              onChange={(e) => setSelectedEndeavor(e.target.value)}
              className="w-full border border-medium-gray/50 bg-black px-3 py-2.5 text-sm text-white outline-none focus:border-code-green"
            >
              <option value="">Select endeavor...</option>
              {endeavors.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              autoFocus
              className="w-full border border-medium-gray/50 bg-transparent px-3 py-2.5 text-sm text-white outline-none placeholder:text-medium-gray/50 focus:border-code-green"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={2}
              className="w-full border border-medium-gray/50 bg-transparent px-3 py-2 text-sm text-white outline-none placeholder:text-medium-gray/50 focus:border-code-green resize-none"
            />

            <div className="flex gap-2">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="border border-medium-gray/50 bg-black px-3 py-2 text-xs text-white outline-none focus:border-code-green"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>

              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="flex-1 border border-medium-gray/50 bg-black px-3 py-2 text-xs text-white outline-none focus:border-code-green"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs text-medium-gray hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating || !title.trim() || !selectedEndeavor}
                className="border border-code-green px-4 py-2 text-xs font-bold text-code-green transition-colors hover:bg-code-green hover:text-black disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Task"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
