"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";

type KeyResult = {
  id: string;
  title: string;
  target_value: number;
  current_value: number;
  unit: string;
  status: string;
  created_at: string;
};

type Objective = {
  id: string;
  endeavor_id: string | null;
  creator_id: string;
  title: string;
  description: string | null;
  period: string;
  status: string;
  progress: number;
  created_at: string;
  key_results: KeyResult[];
};

export default function OKRsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Create form state
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPeriod, setNewPeriod] = useState("Q1 2026");
  const [keyResultInputs, setKeyResultInputs] = useState([
    { title: "", targetValue: "100", unit: "%" },
  ]);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!session) return;
    fetch("/api/okrs")
      .then((r) => (r.ok ? r.json() : []))
      .then(setObjectives)
      .finally(() => setLoading(false));
  }, [session]);

  async function createObjective() {
    if (!newTitle.trim()) return;
    const validKRs = keyResultInputs.filter((kr) => kr.title.trim());
    if (validKRs.length === 0) {
      toast("Add at least one key result", "error");
      return;
    }
    setCreating(true);
    const res = await fetch("/api/okrs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
        period: newPeriod,
        keyResults: validKRs.map((kr) => ({
          title: kr.title.trim(),
          targetValue: Number(kr.targetValue) || 100,
          unit: kr.unit || "%",
        })),
      }),
    });
    if (res.ok) {
      const obj = await res.json();
      setObjectives((prev) => [obj, ...prev]);
      setNewTitle("");
      setNewDescription("");
      setKeyResultInputs([{ title: "", targetValue: "100", unit: "%" }]);
      setShowForm(false);
      toast("Objective created!", "success");
    } else {
      toast("Failed to create objective", "error");
    }
    setCreating(false);
  }

  function addKeyResultInput() {
    setKeyResultInputs((prev) => [...prev, { title: "", targetValue: "100", unit: "%" }]);
  }

  function removeKeyResultInput(index: number) {
    setKeyResultInputs((prev) => prev.filter((_, i) => i !== index));
  }

  function updateKeyResultInput(index: number, field: string, value: string) {
    setKeyResultInputs((prev) =>
      prev.map((kr, i) => (i === index ? { ...kr, [field]: value } : kr))
    );
  }

  async function updateProgress(objectiveId: string, kr: KeyResult, newValue: string) {
    const currentValue = Number(newValue);
    if (isNaN(currentValue) || currentValue < 0) return;

    const res = await fetch(`/api/okrs/${objectiveId}/progress`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyResultId: kr.id, currentValue }),
    });

    if (res.ok) {
      const { progress, keyResultStatus } = await res.json();
      setObjectives((prev) =>
        prev.map((obj) =>
          obj.id === objectiveId
            ? {
                ...obj,
                progress,
                key_results: obj.key_results.map((k) =>
                  k.id === kr.id
                    ? { ...k, current_value: currentValue, status: keyResultStatus }
                    : k
                ),
              }
            : obj
        )
      );
      toast("Progress updated", "success");
    } else {
      toast("Failed to update progress", "error");
    }
  }

  const activeObjectives = objectives.filter((o) => o.status === "active");
  const completedObjectives = objectives.filter((o) => o.status === "completed");

  if (!session) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "OKRs", href: "/okrs" }} />
        <main className="mx-auto max-w-3xl px-4 pt-24 pb-16 text-center">
          <p className="text-medium-gray">
            <Link href="/login" className="text-code-blue hover:text-code-green">Log in</Link> to track OKRs.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "OKRs", href: "/okrs" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">OKRs</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 text-xs font-semibold border border-code-green bg-code-green text-black hover:bg-transparent hover:text-code-green transition-colors"
          >
            {showForm ? "Cancel" : "New Objective"}
          </button>
        </div>
        <p className="text-sm text-medium-gray mb-6">
          Set objectives and measure progress with key results.
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-6 text-xs text-medium-gray">
          <span><span className="text-code-green font-bold">{activeObjectives.length}</span> active</span>
          <span><span className="text-purple-400 font-bold">{completedObjectives.length}</span> completed</span>
          {objectives.length > 0 && (
            <span className="text-code-green">
              {Math.round(objectives.reduce((sum, o) => sum + o.progress, 0) / objectives.length)}% avg progress
            </span>
          )}
        </div>

        {/* Create form */}
        {showForm && (
          <div className="border border-medium-gray/20 p-4 mb-6">
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// new objective"}
            </h2>
            <div className="space-y-3">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Objective title"
                className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
              />
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray resize-none"
              />
              <div className="flex gap-2">
                <select
                  value={newPeriod}
                  onChange={(e) => setNewPeriod(e.target.value)}
                  className="border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white"
                >
                  <option value="Q1 2026">Q1 2026</option>
                  <option value="Q2 2026">Q2 2026</option>
                  <option value="Q3 2026">Q3 2026</option>
                  <option value="Q4 2026">Q4 2026</option>
                </select>
              </div>

              {/* Key Results */}
              <div>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-code-green">
                  {"// key results"}
                </h3>
                <div className="space-y-2">
                  {keyResultInputs.map((kr, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input
                        value={kr.title}
                        onChange={(e) => updateKeyResultInput(i, "title", e.target.value)}
                        placeholder={`Key result ${i + 1}`}
                        className="flex-1 border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
                      />
                      <input
                        value={kr.targetValue}
                        onChange={(e) => updateKeyResultInput(i, "targetValue", e.target.value)}
                        placeholder="Target"
                        type="number"
                        className="w-20 border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
                      />
                      <input
                        value={kr.unit}
                        onChange={(e) => updateKeyResultInput(i, "unit", e.target.value)}
                        placeholder="Unit"
                        className="w-16 border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
                      />
                      {keyResultInputs.length > 1 && (
                        <button
                          onClick={() => removeKeyResultInput(i)}
                          className="text-medium-gray hover:text-red-400 text-xs px-2 py-2"
                        >
                          x
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={addKeyResultInput}
                  className="mt-2 text-xs text-code-blue hover:text-code-green transition-colors"
                >
                  + Add key result
                </button>
              </div>

              <button
                onClick={createObjective}
                disabled={creating || !newTitle.trim()}
                className="px-4 py-2 text-xs font-semibold border border-code-green bg-code-green text-black hover:bg-transparent hover:text-code-green transition-colors disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create Objective"}
              </button>
            </div>
          </div>
        )}

        {/* Objectives list */}
        {loading ? (
          <p className="text-sm text-medium-gray">Loading...</p>
        ) : objectives.length === 0 ? (
          <div className="border border-medium-gray/20 p-8 text-center">
            <p className="text-sm text-medium-gray">No objectives yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {objectives.map((obj) => {
              const isExpanded = expandedId === obj.id;
              return (
                <div key={obj.id} className="border border-medium-gray/20">
                  {/* Objective header */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : obj.id)}
                    className="w-full text-left p-4 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-medium-gray">{isExpanded ? "v" : ">"}</span>
                        <h3 className="text-sm font-medium text-light-gray">{obj.title}</h3>
                        <span className={`text-xs px-2 py-0.5 ${
                          obj.status === "completed"
                            ? "bg-code-green/10 text-code-green"
                            : "bg-code-blue/10 text-code-blue"
                        }`}>
                          {obj.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-medium-gray">{obj.period}</span>
                        <span className="text-xs font-mono text-code-green">{obj.progress}%</span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-medium-gray/20">
                      <div
                        className="h-full bg-code-green transition-all duration-300"
                        style={{ width: `${Math.min(100, obj.progress)}%` }}
                      />
                    </div>
                    {obj.description && (
                      <p className="text-xs text-medium-gray mt-2">{obj.description}</p>
                    )}
                    <p className="text-xs text-medium-gray/60 mt-1">
                      {obj.key_results.length} key result{obj.key_results.length !== 1 ? "s" : ""}
                      {" \u00b7 "}
                      {formatTimeAgo(obj.created_at)}
                    </p>
                  </button>

                  {/* Expanded key results */}
                  {isExpanded && (
                    <div className="border-t border-medium-gray/20 p-4 space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-widest text-code-green">
                        {"// key results"}
                      </h4>
                      {obj.key_results.length === 0 ? (
                        <p className="text-xs text-medium-gray">No key results defined.</p>
                      ) : (
                        obj.key_results.map((kr) => {
                          const pct = kr.target_value > 0
                            ? Math.min(100, Math.round((kr.current_value / kr.target_value) * 100))
                            : 0;
                          return (
                            <div key={kr.id} className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-light-gray">{kr.title}</span>
                                <span className={`text-xs px-1.5 py-0.5 ${
                                  kr.status === "completed"
                                    ? "text-code-green bg-code-green/10"
                                    : kr.status === "in-progress"
                                    ? "text-code-blue bg-code-blue/10"
                                    : "text-medium-gray bg-medium-gray/10"
                                }`}>
                                  {kr.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-medium-gray/20">
                                  <div
                                    className={`h-full transition-all duration-300 ${
                                      pct >= 100 ? "bg-code-green" : pct > 0 ? "bg-code-blue" : "bg-medium-gray/30"
                                    }`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="text-xs font-mono text-medium-gray shrink-0">
                                  {kr.current_value}/{kr.target_value} {kr.unit}
                                </span>
                              </div>
                              {/* Inline update */}
                              <div className="flex items-center gap-2 mt-1">
                                <input
                                  type="number"
                                  defaultValue={kr.current_value}
                                  min="0"
                                  step="any"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      updateProgress(obj.id, kr, (e.target as HTMLInputElement).value);
                                    }
                                  }}
                                  className="w-24 border border-medium-gray/30 bg-black px-2 py-1 text-xs text-white"
                                />
                                <button
                                  onClick={(e) => {
                                    const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                                    if (input) updateProgress(obj.id, kr, input.value);
                                  }}
                                  className="text-xs text-code-blue hover:text-code-green transition-colors"
                                >
                                  Update
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
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
