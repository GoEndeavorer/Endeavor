"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/toast";

type TimeEntry = {
  id: string;
  description: string | null;
  duration_minutes: number;
  entry_date: string;
  user_name: string;
  task_title: string | null;
};

type Summary = {
  total_minutes: number;
  days_tracked: number;
  contributors: number;
};

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function TimeTracker({ endeavorId }: { endeavorId: string }) {
  const { toast } = useToast();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [summary, setSummary] = useState<Summary>({ total_minutes: 0, days_tracked: 0, contributors: 0 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/time-entries`)
      .then((r) => (r.ok ? r.json() : { entries: [], summary: {} }))
      .then((data) => {
        setEntries(data.entries);
        setSummary(data.summary);
      })
      .finally(() => setLoading(false));
  }, [endeavorId]);

  async function logTime() {
    const totalMinutes = (parseInt(hours || "0") * 60) + parseInt(minutes || "0");
    if (totalMinutes < 1) return;

    setSubmitting(true);
    const res = await fetch(`/api/endeavors/${endeavorId}/time-entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: description || undefined,
        durationMinutes: totalMinutes,
      }),
    });
    if (res.ok) {
      toast("Time logged!", "success");
      setDescription("");
      setHours("");
      setMinutes("");
      setShowForm(false);
      // Refresh
      const r = await fetch(`/api/endeavors/${endeavorId}/time-entries`);
      if (r.ok) {
        const data = await r.json();
        setEntries(data.entries);
        setSummary(data.summary);
      }
    }
    setSubmitting(false);
  }

  return (
    <div className="border border-medium-gray/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// time tracking"}
        </h4>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs text-code-blue hover:text-code-green transition-colors"
        >
          {showForm ? "Cancel" : "+ Log time"}
        </button>
      </div>

      {/* Summary */}
      <div className="flex items-center gap-4 mb-3 text-xs text-medium-gray">
        <span>
          <span className="text-code-green font-bold">{formatDuration(Number(summary.total_minutes))}</span> total
        </span>
        <span>
          <span className="font-bold text-white">{Number(summary.days_tracked)}</span> days tracked
        </span>
        <span>
          <span className="font-bold text-white">{Number(summary.contributors)}</span> contributors
        </span>
      </div>

      {showForm && (
        <div className="mb-3 pb-3 border-b border-medium-gray/10 space-y-2">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What did you work on?"
            className="w-full border border-medium-gray/30 bg-black px-3 py-1.5 text-sm text-white placeholder:text-medium-gray"
          />
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="0"
              min="0"
              max="24"
              className="w-16 border border-medium-gray/30 bg-black px-2 py-1.5 text-sm text-white text-center"
            />
            <span className="text-xs text-medium-gray">h</span>
            <input
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="0"
              min="0"
              max="59"
              className="w-16 border border-medium-gray/30 bg-black px-2 py-1.5 text-sm text-white text-center"
            />
            <span className="text-xs text-medium-gray">m</span>
            <button
              onClick={logTime}
              disabled={submitting || ((parseInt(hours || "0") * 60) + parseInt(minutes || "0") < 1)}
              className="px-3 py-1.5 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors disabled:opacity-50"
            >
              {submitting ? "..." : "Log"}
            </button>
          </div>
        </div>
      )}

      {/* Recent entries */}
      {!loading && entries.length > 0 && (
        <div className="space-y-1">
          {entries.slice(0, 5).map((e) => (
            <div key={e.id} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-medium-gray">{e.user_name}</span>
                {e.description && (
                  <span className="text-light-gray truncate">{e.description}</span>
                )}
                {e.task_title && (
                  <span className="text-code-blue truncate">[{e.task_title}]</span>
                )}
              </div>
              <span className="text-code-green font-mono shrink-0 ml-2">
                {formatDuration(e.duration_minutes)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
