"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
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

export default function GoalsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newTargetDate, setNewTargetDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("active");

  useEffect(() => {
    if (!session) return;
    fetch("/api/goals")
      .then((r) => (r.ok ? r.json() : []))
      .then(setGoals)
      .finally(() => setLoading(false));
  }, [session]);

  async function createGoal() {
    if (!newTitle.trim()) return;
    setCreating(true);
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle.trim(),
        targetDate: newTargetDate || undefined,
      }),
    });
    if (res.ok) {
      const goal = await res.json();
      setGoals((prev) => [goal, ...prev]);
      setNewTitle("");
      setNewTargetDate("");
      toast("Goal created!", "success");
    }
    setCreating(false);
  }

  async function toggleGoal(goalId: string, completed: boolean) {
    setGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, completed, completed_at: completed ? new Date().toISOString() : null } : g
      )
    );

    const res = await fetch("/api/goals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goalId, completed }),
    });

    if (!res.ok) {
      setGoals((prev) =>
        prev.map((g) => (g.id === goalId ? { ...g, completed: !completed, completed_at: null } : g))
      );
      toast("Failed to update goal", "error");
    }
  }

  const filtered = goals.filter((g) => {
    if (filter === "active") return !g.completed;
    if (filter === "completed") return g.completed;
    return true;
  });

  const completedCount = goals.filter((g) => g.completed).length;
  const activeCount = goals.length - completedCount;

  if (!session) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Goals", href: "/goals" }} />
        <main className="mx-auto max-w-3xl px-4 pt-24 pb-16 text-center">
          <p className="text-medium-gray">
            <Link href="/login" className="text-code-blue hover:text-code-green">Log in</Link> to set goals.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Goals", href: "/goals" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <h1 className="text-2xl font-bold mb-2">Goals</h1>
        <p className="text-sm text-medium-gray mb-6">Track what you want to accomplish.</p>

        {/* Stats bar */}
        <div className="flex items-center gap-4 mb-6 text-xs text-medium-gray">
          <span><span className="text-code-green font-bold">{activeCount}</span> active</span>
          <span><span className="text-purple-400 font-bold">{completedCount}</span> completed</span>
          {goals.length > 0 && (
            <span className="text-code-green">
              {Math.round((completedCount / goals.length) * 100)}% done
            </span>
          )}
        </div>

        {/* Create form */}
        <div className="border border-medium-gray/20 p-4 mb-6">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// new goal"}
          </h2>
          <div className="flex gap-2">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What do you want to achieve?"
              className="flex-1 border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
              onKeyDown={(e) => e.key === "Enter" && createGoal()}
            />
            <input
              type="date"
              value={newTargetDate}
              onChange={(e) => setNewTargetDate(e.target.value)}
              className="border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white"
            />
            <button
              onClick={createGoal}
              disabled={creating || !newTitle.trim()}
              className="px-4 py-2 text-xs font-semibold border border-code-green bg-code-green text-black hover:bg-transparent hover:text-code-green transition-colors disabled:opacity-50"
            >
              {creating ? "..." : "Add"}
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4">
          {(["active", "completed", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 text-xs transition-colors ${
                filter === f
                  ? "bg-code-green/10 text-code-green border border-code-green/30"
                  : "text-medium-gray hover:text-white border border-medium-gray/20"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Goals list */}
        {loading ? (
          <p className="text-sm text-medium-gray">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="border border-medium-gray/20 p-8 text-center">
            <p className="text-sm text-medium-gray">
              {filter === "completed" ? "No completed goals yet." : "No goals yet. Set one above!"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((goal) => {
              const isOverdue = goal.target_date && !goal.completed && new Date(goal.target_date) < new Date();
              const daysLeft = goal.target_date
                ? Math.ceil((new Date(goal.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : null;

              return (
                <div
                  key={goal.id}
                  className={`flex items-center gap-3 border p-3 transition-colors ${
                    goal.completed
                      ? "border-medium-gray/10 opacity-60"
                      : isOverdue
                      ? "border-red-400/30"
                      : "border-medium-gray/20"
                  }`}
                >
                  <button
                    onClick={() => toggleGoal(goal.id, !goal.completed)}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center border text-xs transition-colors ${
                      goal.completed
                        ? "border-code-green bg-code-green/20 text-code-green"
                        : "border-medium-gray/30 hover:border-code-green"
                    }`}
                  >
                    {goal.completed && "✓"}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${goal.completed ? "line-through text-medium-gray" : "text-light-gray"}`}>
                      {goal.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {goal.target_date && (
                        <span className={`text-xs ${isOverdue ? "text-red-400" : daysLeft !== null && daysLeft <= 3 ? "text-yellow-400" : "text-medium-gray"}`}>
                          {isOverdue
                            ? "Overdue"
                            : daysLeft === 0
                            ? "Due today"
                            : daysLeft === 1
                            ? "Due tomorrow"
                            : `${daysLeft}d left`}
                        </span>
                      )}
                      {goal.completed_at && (
                        <span className="text-xs text-purple-400">
                          Completed {new Date(goal.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
