"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/toast";

type Risk = {
  id: string;
  title: string;
  description: string | null;
  severity: string;
  likelihood: string;
  mitigation: string | null;
  status: string;
  created_by_name: string;
};

type RiskMatrixProps = {
  endeavorId: string;
  canEdit?: boolean;
};

const severityColors: Record<string, string> = {
  critical: "border-red-500 text-red-400",
  high: "border-red-400/50 text-red-400",
  medium: "border-yellow-400/50 text-yellow-400",
  low: "border-code-green/50 text-code-green",
};

export function RiskMatrix({ endeavorId, canEdit = false }: RiskMatrixProps) {
  const { toast } = useToast();
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [likelihood, setLikelihood] = useState("medium");
  const [mitigation, setMitigation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/risks`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setRisks)
      .finally(() => setLoading(false));
  }, [endeavorId]);

  async function addRisk() {
    if (!title.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/endeavors/${endeavorId}/risks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), severity, likelihood, mitigation: mitigation || undefined }),
    });
    if (res.ok) {
      const risk = await res.json();
      setRisks((prev) => [risk, ...prev]);
      setTitle("");
      setMitigation("");
      setShowForm(false);
      toast("Risk logged!", "success");
    }
    setSubmitting(false);
  }

  async function updateStatus(riskId: string, status: string) {
    await fetch(`/api/endeavors/${endeavorId}/risks`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ riskId, status }),
    });
    setRisks((prev) => prev.map((r) => (r.id === riskId ? { ...r, status } : r)));
  }

  if (loading) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// risks"}
        </h3>
        {canEdit && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs text-medium-gray hover:text-code-green transition-colors"
          >
            {showForm ? "Cancel" : "+ Add"}
          </button>
        )}
      </div>

      {showForm && (
        <div className="border border-medium-gray/20 p-3 mb-3 space-y-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Risk description"
            className="w-full border border-medium-gray/30 bg-black px-2 py-1.5 text-sm text-white placeholder:text-medium-gray"
          />
          <div className="grid grid-cols-2 gap-2">
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="border border-medium-gray/30 bg-black px-2 py-1.5 text-sm text-white"
            >
              <option value="low">Low severity</option>
              <option value="medium">Medium severity</option>
              <option value="high">High severity</option>
              <option value="critical">Critical severity</option>
            </select>
            <select
              value={likelihood}
              onChange={(e) => setLikelihood(e.target.value)}
              className="border border-medium-gray/30 bg-black px-2 py-1.5 text-sm text-white"
            >
              <option value="low">Low likelihood</option>
              <option value="medium">Medium likelihood</option>
              <option value="high">High likelihood</option>
            </select>
          </div>
          <input
            value={mitigation}
            onChange={(e) => setMitigation(e.target.value)}
            placeholder="Mitigation plan (optional)"
            className="w-full border border-medium-gray/30 bg-black px-2 py-1.5 text-sm text-white placeholder:text-medium-gray"
          />
          <button
            onClick={addRisk}
            disabled={submitting || !title.trim()}
            className="px-3 py-1 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors disabled:opacity-50"
          >
            {submitting ? "Adding..." : "Log Risk"}
          </button>
        </div>
      )}

      {risks.length === 0 ? (
        <p className="text-xs text-medium-gray">No risks logged yet.</p>
      ) : (
        <div className="space-y-2">
          {risks.map((risk) => (
            <div key={risk.id} className={`border p-3 ${severityColors[risk.severity] || "border-medium-gray/20"}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs px-1.5 py-0.5 border border-current">
                      {risk.severity}
                    </span>
                    <span className="text-xs text-medium-gray">
                      {risk.likelihood} likelihood
                    </span>
                    {risk.status !== "identified" && (
                      <span className="text-xs text-medium-gray">[{risk.status}]</span>
                    )}
                  </div>
                  <p className="text-sm text-light-gray">{risk.title}</p>
                  {risk.mitigation && (
                    <p className="text-xs text-medium-gray mt-1">Mitigation: {risk.mitigation}</p>
                  )}
                </div>
                {canEdit && risk.status === "identified" && (
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => updateStatus(risk.id, "mitigated")}
                      className="text-xs text-medium-gray hover:text-code-green transition-colors"
                    >
                      Mitigate
                    </button>
                    <button
                      onClick={() => updateStatus(risk.id, "resolved")}
                      className="text-xs text-medium-gray hover:text-code-blue transition-colors"
                    >
                      Resolve
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
