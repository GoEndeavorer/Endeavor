"use client";

import { useState, useEffect, useCallback } from "react";
import { formatTimeAgo } from "@/lib/time";

type Poll = {
  id: string;
  question: string;
  options: string[];
  status: string;
  endsAt: string | null;
  authorId: string;
  authorName: string;
  createdAt: string;
  totalVotes: number;
  voteCounts: Record<number, number>;
  userVote: number | null;
};

export function Polls({ endeavorId }: { endeavorId: string }) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [voting, setVoting] = useState<string | null>(null);

  const fetchPolls = useCallback(() => {
    fetch(`/api/endeavors/${endeavorId}/polls`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setPolls(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [endeavorId]);

  useEffect(() => {
    fetchPolls();
  }, [fetchPolls]);

  const createPoll = async () => {
    const validOptions = options.filter((o) => o.trim());
    if (!question.trim() || validOptions.length < 2) return;

    const res = await fetch(`/api/endeavors/${endeavorId}/polls`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question: question.trim(),
        options: validOptions,
      }),
    });

    if (res.ok) {
      setCreating(false);
      setQuestion("");
      setOptions(["", ""]);
      fetchPolls();
    }
  };

  const vote = async (pollId: string, optionIndex: number) => {
    setVoting(pollId);
    const res = await fetch(`/api/polls/${pollId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionIndex }),
    });

    if (res.ok) {
      fetchPolls();
    }
    setVoting(null);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse bg-medium-gray/10 border border-medium-gray/10" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// polls"}
        </h3>
        <button
          onClick={() => setCreating(!creating)}
          className="text-xs text-medium-gray hover:text-code-green transition-colors"
        >
          {creating ? "Cancel" : "+ New Poll"}
        </button>
      </div>

      {creating && (
        <div className="mb-4 border border-medium-gray/20 p-4 space-y-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question..."
            className="w-full border border-medium-gray/30 bg-transparent px-3 py-2 text-sm text-white placeholder:text-medium-gray/50 focus:border-code-green focus:outline-none"
          />
          {options.map((opt, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={opt}
                onChange={(e) => {
                  const newOpts = [...options];
                  newOpts[i] = e.target.value;
                  setOptions(newOpts);
                }}
                placeholder={`Option ${i + 1}`}
                className="flex-1 border border-medium-gray/30 bg-transparent px-3 py-1.5 text-sm text-white placeholder:text-medium-gray/50 focus:border-code-green focus:outline-none"
              />
              {options.length > 2 && (
                <button
                  onClick={() => setOptions(options.filter((_, j) => j !== i))}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  x
                </button>
              )}
            </div>
          ))}
          <div className="flex gap-2">
            {options.length < 10 && (
              <button
                onClick={() => setOptions([...options, ""])}
                className="text-xs text-medium-gray hover:text-code-green"
              >
                + Add option
              </button>
            )}
            <button
              onClick={createPoll}
              disabled={!question.trim() || options.filter((o) => o.trim()).length < 2}
              className="ml-auto border border-code-green px-3 py-1 text-xs font-semibold text-code-green hover:bg-code-green/10 disabled:opacity-30"
            >
              Create Poll
            </button>
          </div>
        </div>
      )}

      {polls.length === 0 && !creating ? (
        <p className="text-xs text-medium-gray py-4 text-center">
          No polls yet. Create one to get team input.
        </p>
      ) : (
        <div className="space-y-3">
          {polls.map((p) => {
            const total = Object.values(p.voteCounts).reduce((a, b) => a + b, 0);
            const hasVoted = p.userVote !== null;
            const isActive = p.status === "active" && (!p.endsAt || new Date(p.endsAt) > new Date());

            return (
              <div key={p.id} className="border border-medium-gray/20 p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold">{p.question}</p>
                  <span className={`shrink-0 text-[10px] px-1.5 py-0.5 border ${
                    isActive ? "border-code-green/30 text-code-green" : "border-medium-gray/30 text-medium-gray"
                  }`}>
                    {isActive ? "Active" : "Closed"}
                  </span>
                </div>

                <div className="space-y-1.5">
                  {p.options.map((opt, i) => {
                    const count = p.voteCounts[i] || 0;
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    const isSelected = p.userVote === i;

                    return (
                      <button
                        key={i}
                        onClick={() => isActive && vote(p.id, i)}
                        disabled={!isActive || voting === p.id}
                        className={`relative w-full text-left border px-3 py-1.5 text-sm transition-colors ${
                          isSelected
                            ? "border-code-green/50 text-code-green"
                            : "border-medium-gray/20 text-light-gray hover:border-medium-gray/40"
                        } disabled:cursor-default`}
                      >
                        {(hasVoted || !isActive) && (
                          <div
                            className="absolute inset-0 bg-code-green/5"
                            style={{ width: `${pct}%` }}
                          />
                        )}
                        <div className="relative flex items-center justify-between">
                          <span>
                            {isSelected && "› "}
                            {opt}
                          </span>
                          {(hasVoted || !isActive) && (
                            <span className="text-xs text-medium-gray ml-2">
                              {pct}% ({count})
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-medium-gray">
                  <span>{total} vote{total !== 1 ? "s" : ""} · by {p.authorName}</span>
                  <span>{formatTimeAgo(p.createdAt)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
