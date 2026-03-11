"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";

type Participant = {
  user_id: string;
  user_name: string;
  user_image: string | null;
  progress: number;
  completed: boolean;
  joined_at: string;
  completed_at: string | null;
};

type Challenge = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string;
  xp_reward: number;
  participant_count: number;
  max_participants: number | null;
  creator_id: string;
  creator_name: string;
  status: string;
  start_date: string;
  end_date: string | null;
  created_at: string;
};

const diffColors: Record<string, string> = {
  easy: "text-code-green border-code-green/30",
  medium: "text-code-blue border-code-blue/30",
  hard: "text-yellow-400 border-yellow-400/30",
  expert: "text-red-400 border-red-400/30",
};

export default function ChallengeDetailPage() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [progress, setProgress] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/challenges?status=active`).then((r) => r.ok ? r.json() : []),
      fetch(`/api/challenges/${challengeId}/progress`).then((r) => r.ok ? r.json() : []),
    ]).then(([challenges, parts]) => {
      const c = challenges.find((ch: Challenge) => ch.id === challengeId);
      setChallenge(c || null);
      setParticipants(parts);
      setLoading(false);
    });
  }, [challengeId]);

  const isParticipant = participants.some((p) => p.user_id === session?.user?.id);
  const myProgress = participants.find((p) => p.user_id === session?.user?.id);

  async function join() {
    setJoining(true);
    const res = await fetch(`/api/challenges/${challengeId}/join`, { method: "POST" });
    if (res.ok) {
      setParticipants((prev) => [
        ...prev,
        { user_id: session!.user.id, user_name: session!.user.name, user_image: null, progress: 0, completed: false, joined_at: new Date().toISOString(), completed_at: null },
      ]);
      toast("Joined challenge!", "success");
    } else {
      const err = await res.json();
      toast(err.error || "Failed to join", "error");
    }
    setJoining(false);
  }

  async function updateProgress() {
    if (!progress) return;
    setUpdating(true);
    const res = await fetch(`/api/challenges/${challengeId}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ progress: Number(progress) }),
    });
    if (res.ok) {
      const result = await res.json();
      setParticipants((prev) =>
        prev.map((p) =>
          p.user_id === session?.user?.id
            ? { ...p, progress: result.progress, completed: result.completed }
            : p
        )
      );
      setProgress("");
      toast(result.completed ? "Challenge completed! 🎉" : "Progress updated!", "success");
    }
    setUpdating(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Challenges", href: "/challenges" }} />
        <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
          <p className="text-sm text-medium-gray">Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Challenges", href: "/challenges" }} />
        <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
          <p className="text-sm text-medium-gray">Challenge not found.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Challenges", href: "/challenges" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs px-1.5 py-0.5 border ${diffColors[challenge.difficulty] || diffColors.medium}`}>
              {challenge.difficulty}
            </span>
            <span className="text-xs px-1.5 py-0.5 border border-medium-gray/20 text-medium-gray">
              {challenge.category}
            </span>
            <span className="text-xs font-bold text-code-green">+{challenge.xp_reward} XP</span>
          </div>
          <h1 className="text-2xl font-bold mb-2">{challenge.title}</h1>
          {challenge.description && (
            <p className="text-sm text-medium-gray mb-2">{challenge.description}</p>
          )}
          <div className="flex items-center gap-3 text-xs text-medium-gray">
            <span>
              Created by{" "}
              <Link href={`/users/${challenge.creator_id}`} className="text-code-blue hover:text-code-green">
                {challenge.creator_name}
              </Link>
            </span>
            <span>{challenge.participant_count} participants</span>
            {challenge.end_date && <span>Ends {formatTimeAgo(challenge.end_date)}</span>}
          </div>
        </div>

        {/* Join / Update progress */}
        {session && !isParticipant && (
          <button
            onClick={join}
            disabled={joining}
            className="mb-6 px-4 py-2 text-xs font-semibold border border-code-green bg-code-green text-black hover:bg-transparent hover:text-code-green transition-colors disabled:opacity-50"
          >
            {joining ? "Joining..." : "Join Challenge"}
          </button>
        )}

        {session && isParticipant && myProgress && !myProgress.completed && (
          <div className="mb-6 border border-code-green/20 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 h-2 bg-medium-gray/10">
                <div
                  className="h-full bg-code-green transition-all"
                  style={{ width: `${myProgress.progress}%` }}
                />
              </div>
              <span className="text-xs text-code-green font-bold">{myProgress.progress}%</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                value={progress}
                onChange={(e) => setProgress(e.target.value)}
                placeholder="Update progress (0-100)"
                type="number"
                min="0"
                max="100"
                className="border border-medium-gray/30 bg-black px-3 py-1.5 text-sm text-white placeholder:text-medium-gray w-48"
              />
              <button
                onClick={updateProgress}
                disabled={updating || !progress}
                className="px-3 py-1.5 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors disabled:opacity-50"
              >
                {updating ? "..." : "Update"}
              </button>
            </div>
          </div>
        )}

        {myProgress?.completed && (
          <div className="mb-6 border border-code-green/30 bg-code-green/5 p-4 text-center">
            <p className="text-sm text-code-green font-bold">Challenge completed!</p>
            <p className="text-xs text-medium-gray mt-1">+{challenge.xp_reward} XP earned</p>
          </div>
        )}

        {/* Leaderboard */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green mb-3">
            {"// leaderboard"}
          </h2>
          {participants.length === 0 ? (
            <p className="text-sm text-medium-gray">No participants yet.</p>
          ) : (
            <div className="space-y-2">
              {participants.map((p, i) => (
                <div key={p.user_id} className="flex items-center gap-3 border border-medium-gray/20 p-3">
                  <span className="text-xs font-bold text-medium-gray w-6 text-center">
                    #{i + 1}
                  </span>
                  <Link
                    href={`/users/${p.user_id}`}
                    className="text-sm text-light-gray hover:text-code-green transition-colors flex-1"
                  >
                    {p.user_name}
                  </Link>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 bg-medium-gray/10">
                      <div
                        className={`h-full ${p.completed ? "bg-code-green" : "bg-code-blue"} transition-all`}
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold ${p.completed ? "text-code-green" : "text-medium-gray"}`}>
                      {p.progress}%
                    </span>
                    {p.completed && (
                      <span className="text-xs text-code-green">✓</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
