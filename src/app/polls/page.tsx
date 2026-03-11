"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";

type PollOption = {
  id: string;
  label: string;
  vote_count: number;
  display_order: number;
};

type Poll = {
  id: string;
  creator_id: string;
  creator_name: string;
  creator_image: string | null;
  title: string;
  description: string | null;
  type: string;
  status: string;
  expires_at: string | null;
  created_at: string;
  total_votes: number;
  options: PollOption[];
  userVotes: string[];
};

export default function PollsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "single" as "single" | "multiple",
    expiresAt: "",
  });
  const [options, setOptions] = useState(["", ""]);

  useEffect(() => {
    if (!session) return;
    fetchPolls();
  }, [session]);

  async function fetchPolls() {
    setLoading(true);
    const res = await fetch("/api/polls");
    if (res.ok) setPolls(await res.json());
    setLoading(false);
  }

  function addOption() {
    if (options.length >= 10) return;
    setOptions([...options, ""]);
  }

  function removeOption(index: number) {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  }

  function updateOption(index: number, value: string) {
    setOptions(options.map((o, i) => (i === index ? value : o)));
  }

  async function createPoll() {
    const validOptions = options.filter((o) => o.trim());
    if (!form.title.trim() || validOptions.length < 2) return;

    setCreating(true);
    const res = await fetch("/api/polls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title.trim(),
        description: form.description || undefined,
        type: form.type,
        options: validOptions,
        expiresAt: form.expiresAt || undefined,
      }),
    });

    if (res.ok) {
      toast("Poll created!", "success");
      setShowCreate(false);
      setForm({ title: "", description: "", type: "single", expiresAt: "" });
      setOptions(["", ""]);
      fetchPolls();
    } else {
      const data = await res.json();
      toast(data.error || "Failed to create poll", "error");
    }
    setCreating(false);
  }

  async function vote(pollId: string, optionId: string) {
    const res = await fetch(`/api/polls/${pollId}/vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionId }),
    });

    if (res.ok) {
      const data = await res.json();
      setPolls((prev) =>
        prev.map((p) =>
          p.id === pollId
            ? {
                ...p,
                options: data.options,
                userVotes: data.userVotes,
                total_votes: data.options.reduce(
                  (sum: number, o: PollOption) => sum + o.vote_count,
                  0
                ),
              }
            : p
        )
      );
      toast("Vote recorded", "success");
    } else {
      const data = await res.json();
      toast(data.error || "Failed to vote", "error");
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Polls", href: "/polls" }} />
        <main className="mx-auto max-w-3xl px-4 pt-24 pb-16 text-center">
          <p className="text-medium-gray">
            <Link href="/login" className="text-code-blue hover:text-code-green">
              Log in
            </Link>{" "}
            to view and create polls.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Polls", href: "/polls" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Polls</h1>
            <p className="text-sm text-medium-gray">
              Vote on community decisions
            </p>
          </div>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="px-4 py-2 text-xs font-semibold border border-code-green bg-code-green text-black hover:bg-transparent hover:text-code-green transition-colors"
          >
            {showCreate ? "Cancel" : "Create Poll"}
          </button>
        </div>

        {/* Create form */}
        {showCreate && (
          <div className="border border-medium-gray/20 p-4 mb-6 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// new poll"}
            </h2>
            <input
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="Poll question or title"
              className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
            />
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Description (optional)"
              rows={2}
              className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray resize-none"
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-medium-gray mb-1 block">
                  Type
                </label>
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      type: e.target.value as "single" | "multiple",
                    }))
                  }
                  className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white"
                >
                  <option value="single">Single choice</option>
                  <option value="multiple">Multiple choice</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-medium-gray mb-1 block">
                  Expires (optional)
                </label>
                <input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, expiresAt: e.target.value }))
                  }
                  className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-medium-gray mb-2 block">
                Options
              </label>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-medium-gray w-5 text-right shrink-0">
                      {i + 1}.
                    </span>
                    <input
                      value={opt}
                      onChange={(e) => updateOption(i, e.target.value)}
                      placeholder={`Option ${i + 1}`}
                      className="flex-1 border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
                    />
                    {options.length > 2 && (
                      <button
                        onClick={() => removeOption(i)}
                        className="text-medium-gray hover:text-red-400 text-xs px-2 py-2 transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {options.length < 10 && (
                <button
                  onClick={addOption}
                  className="mt-2 text-xs text-code-blue hover:text-code-green transition-colors"
                >
                  + Add option
                </button>
              )}
            </div>

            <button
              onClick={createPoll}
              disabled={
                creating ||
                !form.title.trim() ||
                options.filter((o) => o.trim()).length < 2
              }
              className="w-full py-2 text-xs font-semibold border border-code-green bg-code-green text-black hover:bg-transparent hover:text-code-green transition-colors disabled:opacity-50"
            >
              {creating ? "Creating..." : "Create Poll"}
            </button>
          </div>
        )}

        {/* Polls list */}
        <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green mb-4">
          {"// active polls"}
        </h2>

        {loading ? (
          <p className="text-sm text-medium-gray">Loading...</p>
        ) : polls.length === 0 ? (
          <div className="border border-medium-gray/20 p-8 text-center">
            <p className="text-sm text-medium-gray">
              No active polls yet. Create one to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {polls.map((poll) => {
              const totalVotes = poll.options.reduce(
                (sum, o) => sum + Number(o.vote_count),
                0
              );
              const hasVoted = poll.userVotes.length > 0;
              const isExpired =
                poll.expires_at && new Date(poll.expires_at) < new Date();
              const isOwner = poll.creator_id === session.user?.id;

              return (
                <div
                  key={poll.id}
                  className="border border-medium-gray/20 p-4 transition-colors hover:border-medium-gray/40"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-light-gray">
                        {poll.title}
                      </h3>
                      {poll.description && (
                        <p className="text-xs text-medium-gray mt-1">
                          {poll.description}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 ml-3 flex flex-col items-end gap-1">
                      <span
                        className={`px-2 py-0.5 text-xs border ${
                          poll.type === "multiple"
                            ? "border-code-blue/30 text-code-blue"
                            : "border-code-green/30 text-code-green"
                        }`}
                      >
                        {poll.type === "multiple"
                          ? "Multi-select"
                          : "Single choice"}
                      </span>
                      {isExpired && (
                        <span className="text-xs text-red-400">Expired</span>
                      )}
                    </div>
                  </div>

                  {/* Options / vote bars */}
                  <div className="space-y-2">
                    {poll.options.map((option) => {
                      const pct =
                        totalVotes > 0
                          ? Math.round(
                              (Number(option.vote_count) / totalVotes) * 100
                            )
                          : 0;
                      const isSelected = poll.userVotes.includes(option.id);

                      return (
                        <button
                          key={option.id}
                          onClick={() =>
                            !isExpired && vote(poll.id, option.id)
                          }
                          disabled={!!isExpired}
                          className={`w-full text-left relative group transition-colors ${
                            isExpired
                              ? "cursor-default opacity-60"
                              : "cursor-pointer"
                          }`}
                        >
                          <div
                            className={`relative border px-3 py-2 overflow-hidden ${
                              isSelected
                                ? "border-code-green/50"
                                : "border-medium-gray/20 hover:border-medium-gray/40"
                            }`}
                          >
                            {/* Progress bar background */}
                            {(hasVoted || isExpired) && (
                              <div
                                className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                                  isSelected
                                    ? "bg-code-green/10"
                                    : "bg-medium-gray/5"
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            )}
                            <div className="relative flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {/* Selection indicator */}
                                <span
                                  className={`w-3.5 h-3.5 shrink-0 border flex items-center justify-center ${
                                    poll.type === "multiple"
                                      ? "rounded-sm"
                                      : "rounded-full"
                                  } ${
                                    isSelected
                                      ? "border-code-green bg-code-green/20"
                                      : "border-medium-gray/40"
                                  }`}
                                >
                                  {isSelected && (
                                    <span className="w-1.5 h-1.5 bg-code-green rounded-full" />
                                  )}
                                </span>
                                <span
                                  className={`text-sm ${
                                    isSelected
                                      ? "text-code-green"
                                      : "text-light-gray"
                                  }`}
                                >
                                  {option.label}
                                </span>
                              </div>
                              {(hasVoted || isExpired) && (
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="text-medium-gray">
                                    {option.vote_count}{" "}
                                    {Number(option.vote_count) === 1
                                      ? "vote"
                                      : "votes"}
                                  </span>
                                  <span className="text-code-blue font-semibold min-w-[3ch] text-right">
                                    {pct}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center gap-3 mt-3 text-xs text-medium-gray">
                    <span>by {poll.creator_name}</span>
                    <span>{formatTimeAgo(poll.created_at)}</span>
                    <span>
                      {totalVotes} {totalVotes === 1 ? "vote" : "votes"} total
                    </span>
                    {poll.expires_at && !isExpired && (
                      <span className="text-yellow-400/70">
                        Expires{" "}
                        {new Date(poll.expires_at).toLocaleDateString()}
                      </span>
                    )}
                    {isOwner && (
                      <span className="text-code-green/60">Your poll</span>
                    )}
                  </div>
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
