"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";

type Decision = {
  id: string;
  title: string;
  context: string | null;
  decision: string;
  rationale: string | null;
  status: string;
  author_name: string;
  created_at: string;
};

const statusIcons: Record<string, { icon: string; color: string }> = {
  decided: { icon: "->", color: "text-code-green" },
  proposed: { icon: "?", color: "text-yellow-400" },
  superseded: { icon: "x", color: "text-medium-gray" },
  reversed: { icon: "<-", color: "text-red-400" },
};

export function DecisionLog({
  endeavorId,
  canAdd = false,
}: {
  endeavorId: string;
  canAdd?: boolean;
}) {
  const { toast } = useToast();
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [decision, setDecision] = useState("");
  const [rationale, setRationale] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/decision-log`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setDecisions)
      .finally(() => setLoading(false));
  }, [endeavorId]);

  async function record() {
    if (!title.trim() || !decision.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/endeavors/${endeavorId}/decision-log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        context: context || undefined,
        decision: decision.trim(),
        rationale: rationale || undefined,
      }),
    });
    if (res.ok) {
      const item = await res.json();
      setDecisions((prev) => [{ ...item, author_name: "You" }, ...prev]);
      setTitle("");
      setContext("");
      setDecision("");
      setRationale("");
      setShowForm(false);
      toast("Decision recorded", "success");
    }
    setSubmitting(false);
  }

  if (loading || (decisions.length === 0 && !canAdd)) return null;

  return (
    <div className="border border-medium-gray/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// decision log"}
        </h4>
        {canAdd && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs text-code-blue hover:text-code-green transition-colors"
          >
            {showForm ? "Cancel" : "+ Record"}
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-3 pb-3 border-b border-medium-gray/10 space-y-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Decision title"
            className="w-full border border-medium-gray/30 bg-black px-3 py-1.5 text-sm text-white placeholder:text-medium-gray"
          />
          <textarea
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Context — why was this decision needed?"
            rows={2}
            className="w-full border border-medium-gray/30 bg-black px-3 py-1.5 text-sm text-white placeholder:text-medium-gray resize-none"
          />
          <textarea
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            placeholder="The decision — what was decided?"
            rows={2}
            className="w-full border border-medium-gray/30 bg-black px-3 py-1.5 text-sm text-white placeholder:text-medium-gray resize-none"
          />
          <textarea
            value={rationale}
            onChange={(e) => setRationale(e.target.value)}
            placeholder="Rationale — why this option?"
            rows={2}
            className="w-full border border-medium-gray/30 bg-black px-3 py-1.5 text-sm text-white placeholder:text-medium-gray resize-none"
          />
          <button
            onClick={record}
            disabled={submitting || !title.trim() || !decision.trim()}
            className="px-3 py-1.5 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors disabled:opacity-50"
          >
            {submitting ? "..." : "Record Decision"}
          </button>
        </div>
      )}

      <div className="space-y-2">
        {decisions.map((d) => {
          const si = statusIcons[d.status] || statusIcons.decided;
          const isExpanded = expanded === d.id;

          return (
            <div key={d.id}>
              <button
                onClick={() => setExpanded(isExpanded ? null : d.id)}
                className="w-full text-left flex items-start gap-2 hover:bg-white/5 p-1 -m-1 transition-colors"
              >
                <span className={`font-mono text-xs font-bold mt-0.5 ${si.color}`}>{si.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-light-gray">{d.title}</p>
                  <p className="text-xs text-medium-gray">
                    {d.author_name} · {formatTimeAgo(d.created_at)}
                  </p>
                </div>
              </button>
              {isExpanded && (
                <div className="ml-6 mt-2 space-y-2 pb-2 border-b border-medium-gray/10">
                  {d.context && (
                    <div>
                      <p className="text-xs text-code-blue font-semibold">Context:</p>
                      <p className="text-xs text-light-gray">{d.context}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-code-green font-semibold">Decision:</p>
                    <p className="text-xs text-light-gray">{d.decision}</p>
                  </div>
                  {d.rationale && (
                    <div>
                      <p className="text-xs text-yellow-400 font-semibold">Rationale:</p>
                      <p className="text-xs text-light-gray">{d.rationale}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
