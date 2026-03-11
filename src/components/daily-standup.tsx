"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/toast";

type Standup = {
  id: string;
  user_id: string;
  yesterday: string | null;
  today: string | null;
  blockers: string | null;
  mood: string | null;
  standup_date: string;
  name: string;
  image: string | null;
};

const moods: { value: string; label: string; color: string }[] = [
  { value: "great", label: ":)", color: "text-code-green" },
  { value: "good", label: ":|", color: "text-code-blue" },
  { value: "meh", label: ":/", color: "text-yellow-400" },
  { value: "struggling", label: ":(", color: "text-red-400" },
];

export function DailyStandup({ endeavorId }: { endeavorId: string }) {
  const { toast } = useToast();
  const [standups, setStandups] = useState<Standup[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [yesterday, setYesterday] = useState("");
  const [today, setToday] = useState("");
  const [blockers, setBlockers] = useState("");
  const [mood, setMood] = useState("good");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/standups?date=${selectedDate}`)
      .then((r) => (r.ok ? r.json() : { standups: [], availableDates: [] }))
      .then((data) => {
        setStandups(data.standups);
        setAvailableDates(data.availableDates);
      })
      .finally(() => setLoading(false));
  }, [endeavorId, selectedDate]);

  async function submit() {
    if (!today.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/endeavors/${endeavorId}/standups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        yesterday: yesterday || undefined,
        today: today.trim(),
        blockers: blockers || undefined,
        mood,
      }),
    });
    if (res.ok) {
      toast("Standup submitted!", "success");
      setShowForm(false);
      // Refresh
      const r = await fetch(`/api/endeavors/${endeavorId}/standups?date=${selectedDate}`);
      if (r.ok) {
        const data = await r.json();
        setStandups(data.standups);
      }
    }
    setSubmitting(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// daily standup"}
        </h3>
        <div className="flex items-center gap-2">
          {availableDates.slice(0, 5).map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDate(String(d))}
              className={`px-2 py-0.5 text-xs transition-colors ${
                String(d) === selectedDate
                  ? "text-code-green bg-code-green/10"
                  : "text-medium-gray hover:text-white"
              }`}
            >
              {new Date(String(d) + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </button>
          ))}
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs text-code-blue hover:text-code-green transition-colors"
          >
            {showForm ? "Cancel" : "+ Add"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="border border-medium-gray/20 p-4 mb-4 space-y-3">
          <div>
            <label className="text-xs text-medium-gray mb-1 block">Yesterday</label>
            <textarea
              value={yesterday}
              onChange={(e) => setYesterday(e.target.value)}
              placeholder="What did you accomplish yesterday?"
              rows={2}
              className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-medium-gray mb-1 block">Today *</label>
            <textarea
              value={today}
              onChange={(e) => setToday(e.target.value)}
              placeholder="What will you work on today?"
              rows={2}
              className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray resize-none"
            />
          </div>
          <div>
            <label className="text-xs text-medium-gray mb-1 block">Blockers</label>
            <textarea
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              placeholder="Anything blocking your progress?"
              rows={2}
              className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray resize-none"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-medium-gray">Mood:</span>
            {moods.map((m) => (
              <button
                key={m.value}
                onClick={() => setMood(m.value)}
                className={`text-lg transition-opacity ${
                  mood === m.value ? `${m.color} opacity-100` : "opacity-30 hover:opacity-60"
                }`}
                title={m.value}
              >
                {m.label}
              </button>
            ))}
          </div>
          <button
            onClick={submit}
            disabled={submitting || !today.trim()}
            className="px-4 py-2 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Standup"}
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-medium-gray">Loading...</p>
      ) : standups.length === 0 ? (
        <div className="border border-medium-gray/20 p-6 text-center">
          <p className="text-sm text-medium-gray">No standups for this date.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {standups.map((s) => {
            const moodInfo = moods.find((m) => m.value === s.mood);
            return (
              <div key={s.id} className="border border-medium-gray/20 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-7 w-7 items-center justify-center bg-code-green/10 border border-code-green/30 text-xs font-bold text-code-green">
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold">{s.name}</span>
                  {moodInfo && (
                    <span className={`text-sm ${moodInfo.color}`} title={moodInfo.value}>
                      {moodInfo.label}
                    </span>
                  )}
                </div>
                {s.yesterday && (
                  <div className="mb-2">
                    <p className="text-xs text-code-blue font-semibold">Yesterday:</p>
                    <p className="text-sm text-light-gray">{s.yesterday}</p>
                  </div>
                )}
                <div className="mb-2">
                  <p className="text-xs text-code-green font-semibold">Today:</p>
                  <p className="text-sm text-light-gray">{s.today}</p>
                </div>
                {s.blockers && (
                  <div>
                    <p className="text-xs text-red-400 font-semibold">Blockers:</p>
                    <p className="text-sm text-light-gray">{s.blockers}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
