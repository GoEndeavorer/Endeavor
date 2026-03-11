"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";

type MentorMatch = {
  userId: string;
  name: string;
  image: string | null;
  bio: string | null;
  xp: number;
  level: number;
  skills: string[];
  matchingSkills: string[];
  matchScore: number;
};

type Mentorship = {
  id: string;
  mentor_id: string;
  mentee_id: string;
  status: string;
  topic: string | null;
  message: string | null;
  created_at: string;
  mentor_name: string;
  mentor_image: string | null;
  mentor_skills: string[] | null;
  mentee_name: string;
  mentee_image: string | null;
};

const titles: Record<number, string> = {
  1: "Newcomer", 2: "Explorer", 3: "Contributor", 4: "Builder",
  5: "Organizer", 6: "Leader", 7: "Pioneer", 8: "Visionary",
  9: "Legend", 10: "Icon",
};

export default function MentorshipPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [tab, setTab] = useState<"find" | "connections">("find");
  const [matches, setMatches] = useState<MentorMatch[]>([]);
  const [connections, setConnections] = useState<Mentorship[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [requestTopic, setRequestTopic] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [showRequestForm, setShowRequestForm] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    if (tab === "find") {
      fetch("/api/mentorship/matches")
        .then((r) => (r.ok ? r.json() : []))
        .then(setMatches)
        .finally(() => setLoading(false));
    } else {
      fetch("/api/mentorship")
        .then((r) => (r.ok ? r.json() : []))
        .then(setConnections)
        .finally(() => setLoading(false));
    }
  }, [session, tab]);

  async function requestMentorship(mentorId: string) {
    setRequestingId(mentorId);
    const res = await fetch("/api/mentorship", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mentorId,
        topic: requestTopic || undefined,
        message: requestMessage || undefined,
      }),
    });
    if (res.ok) {
      toast("Mentorship request sent!", "success");
      setShowRequestForm(null);
      setRequestTopic("");
      setRequestMessage("");
      setMatches((prev) => prev.filter((m) => m.userId !== mentorId));
    } else {
      const data = await res.json();
      toast(data.error || "Failed to send request", "error");
    }
    setRequestingId(null);
  }

  async function handleAction(mentorshipId: string, action: string) {
    const res = await fetch("/api/mentorship", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mentorshipId, action }),
    });
    if (res.ok) {
      toast(`Mentorship ${action}ed`, "success");
      setConnections((prev) =>
        prev.map((c) =>
          c.id === mentorshipId
            ? { ...c, status: action === "accept" ? "active" : action === "decline" ? "declined" : "completed" }
            : c
        )
      );
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Mentorship", href: "/mentorship" }} />
        <main className="mx-auto max-w-3xl px-4 pt-24 pb-16 text-center">
          <p className="text-medium-gray">
            <Link href="/login" className="text-code-blue hover:text-code-green">Log in</Link> to find mentors.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Mentorship", href: "/mentorship" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <h1 className="text-2xl font-bold mb-2">Mentorship</h1>
        <p className="text-sm text-medium-gray mb-6">
          Connect with experienced community members who share your interests.
        </p>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(["find", "connections"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs font-semibold uppercase transition-colors ${
                tab === t
                  ? "bg-code-green/10 text-code-green border border-code-green/30"
                  : "text-medium-gray hover:text-white border border-medium-gray/20"
              }`}
            >
              {t === "find" ? "Find Mentors" : "My Connections"}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-medium-gray text-sm">Loading...</p>
        ) : tab === "find" ? (
          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// suggested mentors"}
            </h2>
            {matches.length === 0 ? (
              <div className="border border-medium-gray/20 p-8 text-center">
                <p className="text-sm text-medium-gray">
                  No mentor matches found. Add skills and interests to your profile to get matched.
                </p>
                <Link href="/settings" className="mt-2 inline-block text-xs text-code-blue hover:text-code-green">
                  Update profile &rarr;
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {matches.map((m) => (
                  <div key={m.userId} className="border border-medium-gray/20 p-4">
                    <div className="flex items-start gap-3">
                      <Link
                        href={`/users/${m.userId}`}
                        className="flex h-12 w-12 shrink-0 items-center justify-center bg-code-green/10 border border-code-green/30 text-lg font-bold text-code-green"
                      >
                        {m.image ? (
                          <img src={m.image} alt={m.name} className="h-full w-full object-cover" />
                        ) : (
                          m.name.charAt(0).toUpperCase()
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Link href={`/users/${m.userId}`} className="font-semibold hover:text-code-green transition-colors">
                            {m.name}
                          </Link>
                          <span className="text-xs text-code-green">
                            Lv.{m.level} {titles[Math.min(m.level, 10)] || "Master"}
                          </span>
                          <span className="text-xs text-medium-gray font-mono">{m.xp.toLocaleString()} XP</span>
                        </div>
                        {m.bio && <p className="text-xs text-medium-gray mt-1 line-clamp-2">{m.bio}</p>}
                        <div className="mt-2 flex flex-wrap gap-1">
                          {m.matchingSkills.map((s) => (
                            <span key={s} className="text-xs px-1.5 py-0.5 border border-code-green/30 text-code-green bg-code-green/5">
                              {s}
                            </span>
                          ))}
                          {m.skills
                            .filter((s) => !m.matchingSkills.includes(s))
                            .slice(0, 3)
                            .map((s) => (
                              <span key={s} className="text-xs px-1.5 py-0.5 border border-medium-gray/20 text-medium-gray">
                                {s}
                              </span>
                            ))}
                        </div>
                      </div>
                      <button
                        onClick={() => setShowRequestForm(showRequestForm === m.userId ? null : m.userId)}
                        className="shrink-0 px-3 py-1.5 text-xs font-semibold border border-code-blue text-code-blue hover:bg-code-blue hover:text-black transition-colors"
                      >
                        Request
                      </button>
                    </div>

                    {showRequestForm === m.userId && (
                      <div className="mt-3 pt-3 border-t border-medium-gray/20 space-y-2">
                        <input
                          value={requestTopic}
                          onChange={(e) => setRequestTopic(e.target.value)}
                          placeholder="Topic (e.g., React, System Design)"
                          className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
                        />
                        <textarea
                          value={requestMessage}
                          onChange={(e) => setRequestMessage(e.target.value)}
                          placeholder="Introduce yourself and what you'd like to learn..."
                          rows={3}
                          className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray resize-none"
                        />
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setShowRequestForm(null)}
                            className="px-3 py-1.5 text-xs text-medium-gray hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => requestMentorship(m.userId)}
                            disabled={requestingId === m.userId}
                            className="px-3 py-1.5 text-xs font-semibold border border-code-green bg-code-green text-black hover:bg-transparent hover:text-code-green transition-colors disabled:opacity-50"
                          >
                            {requestingId === m.userId ? "Sending..." : "Send Request"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// connections"}
            </h2>
            {connections.length === 0 ? (
              <div className="border border-medium-gray/20 p-8 text-center">
                <p className="text-sm text-medium-gray">No mentorship connections yet.</p>
                <button
                  onClick={() => setTab("find")}
                  className="mt-2 text-xs text-code-blue hover:text-code-green"
                >
                  Find mentors &rarr;
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {connections.map((c) => {
                  const isMentor = c.mentor_id === session.user.id;
                  const otherName = isMentor ? c.mentee_name : c.mentor_name;
                  const otherId = isMentor ? c.mentee_id : c.mentor_id;

                  const statusColors: Record<string, string> = {
                    pending: "text-yellow-400 border-yellow-400/30",
                    active: "text-code-green border-code-green/30",
                    declined: "text-red-400 border-red-400/30",
                    completed: "text-purple-400 border-purple-400/30",
                  };

                  return (
                    <div key={c.id} className="border border-medium-gray/20 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Link href={`/users/${otherId}`} className="font-semibold text-sm hover:text-code-green transition-colors">
                            {otherName}
                          </Link>
                          <span className="text-xs text-medium-gray">
                            {isMentor ? "(you're mentoring)" : "(your mentor)"}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 border ${statusColors[c.status] || "text-medium-gray border-medium-gray/30"}`}>
                          {c.status}
                        </span>
                      </div>
                      {c.topic && (
                        <p className="text-xs text-code-blue mb-1">Topic: {c.topic}</p>
                      )}
                      {c.message && (
                        <p className="text-xs text-light-gray mb-2">{c.message}</p>
                      )}
                      <p className="text-xs text-medium-gray">{formatTimeAgo(c.created_at)}</p>

                      {/* Actions */}
                      {c.status === "pending" && isMentor && (
                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => handleAction(c.id, "accept")}
                            className="px-3 py-1 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleAction(c.id, "decline")}
                            className="px-3 py-1 text-xs text-medium-gray hover:text-red-400 border border-medium-gray/20 hover:border-red-400/30 transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      )}
                      {c.status === "active" && (
                        <div className="mt-3 flex gap-2">
                          <Link
                            href={`/messages?to=${otherId}`}
                            className="px-3 py-1 text-xs font-semibold border border-code-blue text-code-blue hover:bg-code-blue hover:text-black transition-colors"
                          >
                            Message
                          </Link>
                          <button
                            onClick={() => handleAction(c.id, "complete")}
                            className="px-3 py-1 text-xs text-medium-gray hover:text-purple-400 border border-medium-gray/20 hover:border-purple-400/30 transition-colors"
                          >
                            Mark Complete
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
