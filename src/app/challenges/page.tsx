"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";

type Challenge = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  start_date: string;
  end_date: string | null;
  max_participants: number | null;
  xp_reward: number;
  status: string;
  participant_count: number;
  creator_name: string;
  created_at: string;
};

const difficultyColors: Record<string, string> = {
  easy: "text-code-green border-code-green/30",
  medium: "text-code-blue border-code-blue/30",
  hard: "text-yellow-400 border-yellow-400/30",
  expert: "text-red-400 border-red-400/30",
};

export default function ChallengesPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"active" | "completed">("active");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [difficulty, setDifficulty] = useState("medium");
  const [xpReward, setXpReward] = useState("50");
  const [submitting, setSubmitting] = useState(false);
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/challenges?status=${filter}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setChallenges)
      .finally(() => setLoading(false));
  }, [filter]);

  async function createChallenge() {
    if (!title.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description || undefined,
        category,
        difficulty,
        xpReward: Number(xpReward) || 50,
      }),
    });
    if (res.ok) {
      const c = await res.json();
      setChallenges((prev) => [{ ...c, creator_name: session!.user.name }, ...prev]);
      setTitle("");
      setDescription("");
      setShowForm(false);
      toast("Challenge created!", "success");
    }
    setSubmitting(false);
  }

  async function joinChallenge(challengeId: string) {
    setJoining(challengeId);
    const res = await fetch(`/api/challenges/${challengeId}/join`, { method: "POST" });
    if (res.ok) {
      setChallenges((prev) =>
        prev.map((c) =>
          c.id === challengeId ? { ...c, participant_count: c.participant_count + 1 } : c
        )
      );
      toast("Joined challenge!", "success");
    } else {
      const err = await res.json();
      toast(err.error || "Failed to join", "error");
    }
    setJoining(null);
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Challenges", href: "/challenges" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Challenges</h1>
            <p className="text-sm text-medium-gray">Compete, grow, and earn XP</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-medium-gray/30">
              {(["active", "completed"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                    filter === s
                      ? "bg-code-green text-black"
                      : "text-medium-gray hover:text-light-gray"
                  }`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            {session && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-1.5 text-xs font-semibold border border-code-green bg-code-green text-black hover:bg-transparent hover:text-code-green transition-colors"
              >
                {showForm ? "Cancel" : "Create Challenge"}
              </button>
            )}
          </div>
        </div>

        {showForm && (
          <div className="border border-medium-gray/20 p-4 mb-6 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// new challenge"}
            </h2>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Challenge title"
              className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              rows={3}
              className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray resize-y"
            />
            <div className="grid grid-cols-3 gap-3">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white"
              >
                <option value="general">General</option>
                <option value="coding">Coding</option>
                <option value="design">Design</option>
                <option value="writing">Writing</option>
                <option value="learning">Learning</option>
                <option value="fitness">Fitness</option>
                <option value="social">Social</option>
              </select>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
              <input
                value={xpReward}
                onChange={(e) => setXpReward(e.target.value)}
                placeholder="XP reward"
                type="number"
                className="border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
              />
            </div>
            <button
              onClick={createChallenge}
              disabled={submitting || !title.trim()}
              className="px-4 py-2 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Challenge"}
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-medium-gray">Loading...</p>
        ) : challenges.length === 0 ? (
          <div className="border border-medium-gray/20 p-8 text-center">
            <p className="text-sm text-medium-gray">
              No {filter} challenges yet.{" "}
              {session && filter === "active" && "Create the first one!"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {challenges.map((c) => (
              <div key={c.id} className="border border-medium-gray/20 p-4 hover:border-code-green/30 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-1.5 py-0.5 border ${difficultyColors[c.difficulty] || difficultyColors.medium}`}>
                        {c.difficulty}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 border border-medium-gray/20 text-medium-gray">
                        {c.category}
                      </span>
                      <span className="text-xs text-code-green font-bold">+{c.xp_reward} XP</span>
                    </div>
                    <h3 className="text-sm font-semibold text-light-gray">{c.title}</h3>
                    {c.description && (
                      <p className="text-xs text-medium-gray mt-1 line-clamp-2">{c.description}</p>
                    )}
                  </div>
                  {session && filter === "active" && (
                    <button
                      onClick={() => joinChallenge(c.id)}
                      disabled={joining === c.id}
                      className="shrink-0 ml-3 px-3 py-1.5 text-xs font-semibold border border-code-blue text-code-blue hover:bg-code-blue hover:text-black transition-colors disabled:opacity-50"
                    >
                      {joining === c.id ? "..." : "Join"}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-medium-gray">
                  <span>{c.participant_count} participant{c.participant_count !== 1 ? "s" : ""}</span>
                  {c.end_date && <span>Ends {formatTimeAgo(c.end_date)}</span>}
                  <span>by {c.creator_name}</span>
                  <span>{formatTimeAgo(c.created_at)}</span>
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
