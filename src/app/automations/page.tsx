"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";

type Automation = {
  id: string;
  name: string;
  trigger_type: string;
  action_type: string;
  enabled: boolean;
  run_count: number;
  last_run_at: string | null;
  created_at: string;
};

const triggerLabels: Record<string, string> = {
  task_completed: "When a task is completed",
  member_joined: "When a member joins",
  milestone_reached: "When a milestone is reached",
  discussion_posted: "When a discussion is posted",
  deadline_approaching: "When a deadline approaches",
};

const actionLabels: Record<string, string> = {
  send_notification: "Send notification",
  post_update: "Post an update",
  assign_badge: "Assign a badge",
  create_task: "Create a follow-up task",
  send_email: "Send an email",
};

export default function AutomationsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState("task_completed");
  const [actionType, setActionType] = useState("send_notification");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!session) return;
    fetch("/api/automations")
      .then((r) => (r.ok ? r.json() : []))
      .then(setAutomations)
      .finally(() => setLoading(false));
  }, [session]);

  async function create() {
    if (!name.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/automations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), triggerType, actionType }),
    });
    if (res.ok) {
      const auto = await res.json();
      setAutomations((prev) => [auto, ...prev]);
      setName("");
      setShowForm(false);
      toast("Automation created!", "success");
    }
    setSubmitting(false);
  }

  async function toggle(id: string, enabled: boolean) {
    await fetch("/api/automations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, enabled: !enabled }),
    });
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !enabled } : a))
    );
  }

  async function remove(id: string) {
    await fetch(`/api/automations?id=${id}`, { method: "DELETE" });
    setAutomations((prev) => prev.filter((a) => a.id !== id));
    toast("Deleted", "success");
  }

  if (!session) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Automations", href: "/automations" }} />
        <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
          <p className="text-sm text-medium-gray">Please log in to manage automations.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Automations", href: "/automations" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Automations</h1>
            <p className="text-sm text-medium-gray">Automate repetitive workflows</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 text-xs font-semibold border border-code-green bg-code-green text-black hover:bg-transparent hover:text-code-green transition-colors"
          >
            {showForm ? "Cancel" : "New Automation"}
          </button>
        </div>

        {showForm && (
          <div className="border border-medium-gray/20 p-4 mb-6 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// create automation"}
            </h2>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Automation name"
              className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-medium-gray mb-1 block">When...</label>
                <select
                  value={triggerType}
                  onChange={(e) => setTriggerType(e.target.value)}
                  className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white"
                >
                  {Object.entries(triggerLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-medium-gray mb-1 block">Then...</label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value)}
                  className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white"
                >
                  {Object.entries(actionLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={create}
              disabled={submitting || !name.trim()}
              className="px-4 py-2 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Automation"}
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-medium-gray">Loading...</p>
        ) : automations.length === 0 ? (
          <div className="border border-medium-gray/20 p-8 text-center">
            <p className="text-sm text-medium-gray">No automations yet. Create your first workflow!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {automations.map((auto) => (
              <div
                key={auto.id}
                className={`border p-4 ${
                  auto.enabled ? "border-code-green/20" : "border-medium-gray/20 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-sm font-semibold text-light-gray">{auto.name}</h3>
                    <p className="text-xs text-medium-gray mt-1">
                      {triggerLabels[auto.trigger_type] || auto.trigger_type}{" → "}
                      {actionLabels[auto.action_type] || auto.action_type}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggle(auto.id, auto.enabled)}
                      className={`text-xs px-2 py-0.5 border transition-colors ${
                        auto.enabled
                          ? "border-code-green/30 text-code-green"
                          : "border-medium-gray/30 text-medium-gray"
                      }`}
                    >
                      {auto.enabled ? "Active" : "Paused"}
                    </button>
                    <button
                      onClick={() => remove(auto.id)}
                      className="text-xs text-medium-gray hover:text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-medium-gray">
                  <span>Ran {auto.run_count} time{auto.run_count !== 1 ? "s" : ""}</span>
                  {auto.last_run_at && <span>Last: {formatTimeAgo(auto.last_run_at)}</span>}
                  <span>Created {formatTimeAgo(auto.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
