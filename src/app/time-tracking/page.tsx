"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";

type TimeEntry = {
  id: string;
  description: string | null;
  duration_minutes: number;
  date: string;
  endeavor_title: string | null;
  user_name: string;
  created_at: string;
};

type Summary = {
  total_minutes: string;
  entry_count: string;
  active_days: string;
};

export default function TimeTrackingPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("week");
  const [showForm, setShowForm] = useState(false);
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/time-tracking?period=${period}`)
      .then((r) => (r.ok ? r.json() : { entries: [], summary: null }))
      .then((data) => {
        setEntries(data.entries);
        setSummary(data.summary);
      })
      .finally(() => setLoading(false));
  }, [period]);

  async function logTime() {
    const totalMinutes = (Number(hours) || 0) * 60 + (Number(minutes) || 0);
    if (totalMinutes < 1) return;
    setSubmitting(true);
    const res = await fetch("/api/time-tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: description || undefined, durationMinutes: totalMinutes, date }),
    });
    if (res.ok) {
      const entry = await res.json();
      setEntries((prev) => [{ ...entry, user_name: session!.user.name, endeavor_title: null }, ...prev]);
      setDescription("");
      setHours("");
      setMinutes("");
      setShowForm(false);
      toast("Time logged!", "success");
    }
    setSubmitting(false);
  }

  function formatDuration(mins: number) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  const totalMins = summary ? Number(summary.total_minutes) : 0;
  const activeDays = summary ? Number(summary.active_days) : 0;
  const entryCount = summary ? Number(summary.entry_count) : 0;

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Time Tracking", href: "/time-tracking" }} />

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Time Tracking</h1>
            <p className="text-sm text-medium-gray">Track time spent on projects and tasks</p>
          </div>
          {session && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors"
            >
              {showForm ? "Cancel" : "+ Log Time"}
            </button>
          )}
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="border border-medium-gray/20 p-4 text-center">
              <p className="text-2xl font-bold text-code-green">{formatDuration(totalMins)}</p>
              <p className="text-xs text-medium-gray">Total Time</p>
            </div>
            <div className="border border-medium-gray/20 p-4 text-center">
              <p className="text-2xl font-bold text-code-blue">{activeDays}</p>
              <p className="text-xs text-medium-gray">Active Days</p>
            </div>
            <div className="border border-medium-gray/20 p-4 text-center">
              <p className="text-2xl font-bold text-light-gray">{entryCount}</p>
              <p className="text-xs text-medium-gray">Entries</p>
            </div>
          </div>
        )}

        {/* Period Filter */}
        <div className="flex gap-2 mb-6">
          {["week", "month", "year"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs font-semibold transition-colors ${
                period === p ? "bg-code-green text-black" : "border border-medium-gray/30 text-medium-gray hover:text-light-gray"
              }`}
            >
              {p === "week" ? "This Week" : p === "month" ? "This Month" : "This Year"}
            </button>
          ))}
        </div>

        {showForm && (
          <div className="border border-medium-gray/20 p-4 mb-6 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green">{"// log time"}</h2>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you work on?"
              className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
            />
            <div className="flex gap-3">
              <div className="flex items-center gap-1">
                <input
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  placeholder="0"
                  type="number"
                  min="0"
                  className="w-16 border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white text-center"
                />
                <span className="text-xs text-medium-gray">hrs</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  placeholder="0"
                  type="number"
                  min="0"
                  max="59"
                  className="w-16 border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white text-center"
                />
                <span className="text-xs text-medium-gray">min</span>
              </div>
              <input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                type="date"
                className="border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white"
              />
            </div>
            <button
              onClick={logTime}
              disabled={submitting || ((Number(hours) || 0) * 60 + (Number(minutes) || 0) < 1)}
              className="px-4 py-2 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors disabled:opacity-50"
            >
              {submitting ? "Logging..." : "Log Time"}
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-medium-gray">Loading...</p>
        ) : entries.length === 0 ? (
          <div className="border border-medium-gray/20 p-8 text-center">
            <p className="text-sm text-medium-gray">No time entries yet. Start tracking!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <div key={entry.id} className="border border-medium-gray/20 p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-light-gray">{entry.description || "No description"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {entry.endeavor_title && (
                      <span className="text-xs text-code-blue">{entry.endeavor_title}</span>
                    )}
                    <span className="text-xs text-medium-gray">{entry.date}</span>
                  </div>
                </div>
                <span className="text-sm font-bold text-code-green">{formatDuration(entry.duration_minutes)}</span>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
