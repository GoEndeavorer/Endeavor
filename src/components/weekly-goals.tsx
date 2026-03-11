"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/toast";

type Goal = {
  id: string;
  title: string;
  completed: boolean;
  completed_at: string | null;
  target_date: string | null;
  endeavor_id: string | null;
  created_at: string;
};

export function WeeklyGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  const fetchGoals = useCallback(async () => {
    try {
      const res = await fetch("/api/goals");
      if (!res.ok) return;
      const data = await res.json();
      setGoals(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  async function toggleGoal(goal: Goal) {
    const prev = [...goals];
    const next = !goal.completed;

    // Optimistic update
    setGoals((g) =>
      g.map((item) =>
        item.id === goal.id ? { ...item, completed: next } : item
      )
    );

    try {
      const res = await fetch("/api/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId: goal.id, completed: next }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setGoals((g) =>
        g.map((item) => (item.id === goal.id ? updated : item))
      );
      toast(next ? "goal completed" : "goal reopened", "success");
    } catch {
      setGoals(prev);
      toast("failed to update goal", "error");
    }
  }

  async function addGoal(e: React.FormEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title || adding) return;

    setAdding(true);
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setGoals((g) => [created, ...g]);
      setNewTitle("");
      toast("goal added", "success");
    } catch {
      toast("failed to add goal", "error");
    } finally {
      setAdding(false);
    }
  }

  const completedCount = goals.filter((g) => g.completed).length;
  const totalCount = goals.length;

  return (
    <div className="border border-medium-gray/20 bg-black p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-mono text-xs text-medium-gray">
          // weekly goals
        </span>
        {totalCount > 0 && (
          <span className="font-mono text-[10px] text-medium-gray">
            {completedCount}/{totalCount}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-5 animate-pulse bg-medium-gray/10"
            />
          ))}
        </div>
      ) : (
        <div className="space-y-1">
          {goals.map((goal) => (
            <button
              key={goal.id}
              onClick={() => toggleGoal(goal)}
              className="flex w-full items-center gap-2 py-1 text-left transition-colors hover:bg-medium-gray/5"
            >
              <span
                className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center border font-mono text-[9px] ${
                  goal.completed
                    ? "border-code-green bg-code-green text-black"
                    : "border-medium-gray/40"
                }`}
              >
                {goal.completed ? "x" : ""}
              </span>
              <span
                className={`font-mono text-xs ${
                  goal.completed
                    ? "text-medium-gray line-through"
                    : "text-light-gray"
                }`}
              >
                {goal.title}
              </span>
            </button>
          ))}

          {goals.length === 0 && !loading && (
            <p className="py-2 font-mono text-xs text-medium-gray/60">
              no goals yet. add one below.
            </p>
          )}
        </div>
      )}

      <form onSubmit={addGoal} className="mt-3 flex gap-2">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="+ add goal"
          maxLength={140}
          className="flex-1 border border-medium-gray/20 bg-transparent px-2 py-1 font-mono text-xs text-light-gray placeholder:text-medium-gray/40 focus:border-code-green/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!newTitle.trim() || adding}
          className="border border-code-green/50 px-2 py-1 font-mono text-xs text-code-green transition-colors hover:bg-code-green hover:text-black disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-code-green"
        >
          {adding ? "..." : "add"}
        </button>
      </form>
    </div>
  );
}
