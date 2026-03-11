"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";

type Standup = {
  id: string;
  yesterday: string | null;
  today: string | null;
  blockers: string | null;
  mood: string;
  date: string;
  user_name: string;
  created_at: string;
};

const MOODS: Record<string, { emoji: string; label: string }> = {
  great: { emoji: "O", label: "Great" },
  good: { emoji: "+", label: "Good" },
  neutral: { emoji: "~", label: "Neutral" },
  struggling: { emoji: "-", label: "Struggling" },
  blocked: { emoji: "!", label: "Blocked" },
};

export default function StandupsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [standups, setStandups] = useState<Standup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [yesterday, setYesterday] = useState("");
  const [today, setToday] = useState("");
  const [blockers, setBlockers] = useState("");
  const [mood, setMood] = useState("neutral");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/standups")
      .then((r) => (r.ok ? r.json() : []))
      .then(setStandups)
      .finally(() => setLoading(false));
  }, []);

  async function submitStandup() {
    if (!yesterday.trim() && !today.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/standups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ yesterday, today, blockers: blockers || undefined, mood }),
    });
    if (res.ok) {
      const standup = await res.json();
      setStandups((prev) => [{ ...standup, user_name: session!.user.name }, ...prev]);
      setYesterday("");
      setToday("");
      setBlockers("");
      setMood("neutral");
      setShowForm(false);
      toast("Standup submitted!", "success");
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Standups", href: "/standups" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Daily Standups</h1>
            <p className="text-sm text-medium-gray">Share what you&apos;re working on</p>
          </div>
          {session && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors"
            >
              {showForm ? "Cancel" : "+ New Standup"}
            </button>
          )}
        </div>

        {showForm && (
          <div className="border border-medium-gray/20 p-4 mb-6 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green">{"// daily check-in"}</h2>
            <div>
              <label className="text-xs text-medium-gray mb-1 block">What did you do yesterday?</label>
              <textarea
                value={yesterday}
                onChange={(e) => setYesterday(e.target.value)}
                rows={2}
                className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray resize-y"
              />
            </div>
            <div>
              <label className="text-xs text-medium-gray mb-1 block">What are you working on today?</label>
              <textarea
                value={today}
                onChange={(e) => setToday(e.target.value)}
                rows={2}
                className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray resize-y"
              />
            </div>
            <div>
              <label className="text-xs text-medium-gray mb-1 block">Any blockers?</label>
              <textarea
                value={blockers}
                onChange={(e) => setBlockers(e.target.value)}
                rows={1}
                className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray resize-y"
              />
            </div>
            <div>
              <label className="text-xs text-medium-gray mb-1 block">Mood</label>
              <div className="flex gap-2">
                {Object.entries(MOODS).map(([key, { emoji, label }]) => (
                  <button
                    key={key}
                    onClick={() => setMood(key)}
                    className={`px-3 py-1 text-xs border transition-colors ${
                      mood === key ? "border-code-green text-code-green" : "border-medium-gray/30 text-medium-gray hover:text-light-gray"
                    }`}
                  >
                    [{emoji}] {label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={submitStandup}
              disabled={submitting || (!yesterday.trim() && !today.trim())}
              className="px-4 py-2 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Standup"}
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-medium-gray">Loading...</p>
        ) : standups.length === 0 ? (
          <div className="border border-medium-gray/20 p-8 text-center">
            <p className="text-sm text-medium-gray">No standups yet. Start your first check-in!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {standups.map((standup) => {
              const m = MOODS[standup.mood] || MOODS.neutral;
              return (
                <div key={standup.id} className="border border-medium-gray/20 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-code-blue">{standup.user_name}</span>
                      <span className="text-xs text-medium-gray">{standup.date}</span>
                    </div>
                    <span className="text-xs border border-medium-gray/30 px-2 py-0.5">[{m.emoji}] {m.label}</span>
                  </div>
                  {standup.yesterday && (
                    <div className="mb-2">
                      <p className="text-xs text-medium-gray mb-0.5">Yesterday:</p>
                      <p className="text-sm text-light-gray">{standup.yesterday}</p>
                    </div>
                  )}
                  {standup.today && (
                    <div className="mb-2">
                      <p className="text-xs text-medium-gray mb-0.5">Today:</p>
                      <p className="text-sm text-light-gray">{standup.today}</p>
                    </div>
                  )}
                  {standup.blockers && (
                    <div>
                      <p className="text-xs text-red-400 mb-0.5">Blockers:</p>
                      <p className="text-sm text-light-gray">{standup.blockers}</p>
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
