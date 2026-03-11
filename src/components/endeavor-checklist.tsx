"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/toast";

type ChecklistItem = {
  id: string;
  title: string;
  completed: boolean;
  completed_by_name: string | null;
};

type EndeavorChecklistProps = {
  endeavorId: string;
  canEdit?: boolean;
};

export function EndeavorChecklist({ endeavorId, canEdit = false }: EndeavorChecklistProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/checklist`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setItems)
      .finally(() => setLoading(false));
  }, [endeavorId]);

  async function addItem() {
    if (!newTitle.trim()) return;
    const res = await fetch(`/api/endeavors/${endeavorId}/checklist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim() }),
    });
    if (res.ok) {
      const item = await res.json();
      setItems((prev) => [...prev, item]);
      setNewTitle("");
    }
  }

  async function toggleItem(itemId: string, completed: boolean) {
    await fetch(`/api/endeavors/${endeavorId}/checklist`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, completed: !completed }),
    });
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, completed: !completed } : i))
    );
  }

  async function deleteItem(itemId: string) {
    await fetch(`/api/endeavors/${endeavorId}/checklist?itemId=${itemId}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  }

  if (loading) return null;

  const completedCount = items.filter((i) => i.completed).length;
  const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// checklist"}
        </h3>
        {items.length > 0 && (
          <span className="text-xs text-medium-gray">
            {completedCount}/{items.length} ({progress}%)
          </span>
        )}
      </div>

      {items.length > 0 && (
        <div className="h-1.5 bg-medium-gray/10 mb-3">
          <div
            className="h-full bg-code-green transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      <div className="space-y-1">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 group">
            <button
              onClick={() => canEdit && toggleItem(item.id, item.completed)}
              disabled={!canEdit}
              className={`w-4 h-4 border flex items-center justify-center text-xs shrink-0 transition-colors ${
                item.completed
                  ? "border-code-green bg-code-green text-black"
                  : "border-medium-gray/30 hover:border-code-green/50"
              }`}
            >
              {item.completed && "✓"}
            </button>
            <span className={`text-sm flex-1 ${item.completed ? "text-medium-gray line-through" : "text-light-gray"}`}>
              {item.title}
            </span>
            {canEdit && (
              <button
                onClick={() => deleteItem(item.id)}
                className="text-xs text-medium-gray hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>

      {canEdit && (
        <div className="flex gap-2 mt-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
            placeholder="Add item..."
            className="flex-1 border border-medium-gray/20 bg-black px-2 py-1 text-xs text-white placeholder:text-medium-gray"
          />
          <button
            onClick={addItem}
            disabled={!newTitle.trim()}
            className="px-2 py-1 text-xs text-code-green hover:bg-code-green hover:text-black border border-code-green/30 transition-colors disabled:opacity-50"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}
