"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/toast";

type PollOption = {
  id: string;
  text: string;
  votes: number;
};

type Poll = {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  userVote: string | null;
  createdAt: string;
  expiresAt: string | null;
};

export function PollWidget({ endeavorId, pollId }: { endeavorId: string; pollId: string }) {
  const { toast } = useToast();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/polls/${pollId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setPoll(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [endeavorId, pollId]);

  async function vote(optionId: string) {
    if (!poll || voting || poll.userVote) return;
    setVoting(true);

    // Optimistic
    setPoll((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        userVote: optionId,
        totalVotes: prev.totalVotes + 1,
        options: prev.options.map((o) =>
          o.id === optionId ? { ...o, votes: o.votes + 1 } : o
        ),
      };
    });

    try {
      const res = await fetch(`/api/endeavors/${endeavorId}/polls/${pollId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ optionId }),
      });
      if (!res.ok) throw new Error();
      toast("Vote recorded");
    } catch {
      // Revert
      setPoll((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          userVote: null,
          totalVotes: prev.totalVotes - 1,
          options: prev.options.map((o) =>
            o.id === optionId ? { ...o, votes: o.votes - 1 } : o
          ),
        };
      });
      toast("Failed to vote", "error");
    } finally {
      setVoting(false);
    }
  }

  if (loading || !poll) return null;

  const hasVoted = !!poll.userVote;
  const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date();

  return (
    <div className="border border-medium-gray/20 p-4">
      <h4 className="text-xs font-semibold uppercase tracking-widest text-code-green mb-3">
        {"// poll"}
      </h4>
      <p className="text-sm font-semibold mb-3">{poll.question}</p>

      <div className="space-y-2">
        {poll.options.map((option) => {
          const percentage = poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
          const isSelected = poll.userVote === option.id;

          return (
            <button
              key={option.id}
              onClick={() => vote(option.id)}
              disabled={hasVoted || isExpired || voting}
              className={`w-full text-left relative overflow-hidden border transition-colors ${
                isSelected
                  ? "border-code-green/40"
                  : "border-medium-gray/20 hover:border-medium-gray/40"
              } ${hasVoted || isExpired ? "cursor-default" : "cursor-pointer"}`}
            >
              {(hasVoted || isExpired) && (
                <div
                  className="absolute inset-0 bg-code-green/5 transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              )}
              <div className="relative px-3 py-2 flex items-center justify-between">
                <span className="text-sm">
                  {isSelected && <span className="text-code-green mr-1">*</span>}
                  {option.text}
                </span>
                {(hasVoted || isExpired) && (
                  <span className="text-xs font-mono text-medium-gray">{percentage}%</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-2 text-xs text-medium-gray">
        {poll.totalVotes} vote{poll.totalVotes !== 1 ? "s" : ""}
        {isExpired && " · Poll ended"}
      </p>
    </div>
  );
}
