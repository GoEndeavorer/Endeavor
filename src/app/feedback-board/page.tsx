"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";

type FeedbackItem = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  vote_count: number;
  comment_count: number;
  author_name: string;
  created_at: string;
};

const STATUSES = ["all", "open", "planned", "in-progress", "completed", "declined"];
const TYPES = ["feature", "bug", "improvement", "question"];

const typeColors: Record<string, string> = {
  feature: "border-code-green/30 text-code-green",
  bug: "border-red-400/30 text-red-400",
  improvement: "border-code-blue/30 text-code-blue",
  question: "border-yellow-400/30 text-yellow-400",
};

const statusColors: Record<string, string> = {
  open: "text-medium-gray",
  planned: "text-code-blue",
  "in-progress": "text-yellow-400",
  completed: "text-code-green",
  declined: "text-red-400",
};

export default function FeedbackBoardPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sort, setSort] = useState("votes");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("feature");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    params.set("sort", sort);
    fetch(`/api/feedback-board?${params}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setItems)
      .finally(() => setLoading(false));
  }, [statusFilter, sort]);

  async function submitFeedback() {
    if (!title.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/feedback-board", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), description: description || undefined, type }),
    });
    if (res.ok) {
      const item = await res.json();
      setItems((prev) => [{ ...item, author_name: session!.user.name }, ...prev]);
      setTitle("");
      setDescription("");
      setShowForm(false);
      toast("Feedback submitted!", "success");
    }
    setSubmitting(false);
  }

  async function vote(itemId: string) {
    if (!session) return;
    const res = await fetch(`/api/feedback-board/${itemId}/vote`, { method: "POST" });
    if (res.ok) {
      const { action } = await res.json();
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, vote_count: action === "voted" ? item.vote_count + 1 : item.vote_count - 1 }
            : item
        )
      );
    }
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Feedback Board", href: "/feedback-board" }} />

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Feedback Board</h1>
            <p className="text-sm text-medium-gray">Submit and vote on ideas</p>
          </div>
          {session && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors"
            >
              {showForm ? "Cancel" : "+ Submit Feedback"}
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex gap-1">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2 py-1 text-xs font-semibold transition-colors ${
                  statusFilter === s ? "bg-code-green text-black" : "border border-medium-gray/30 text-medium-gray hover:text-light-gray"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1).replace("-", " ")}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setSort("votes")}
              className={`px-2 py-1 text-xs font-semibold transition-colors ${
                sort === "votes" ? "bg-code-blue text-black" : "border border-medium-gray/30 text-medium-gray"
              }`}
            >
              Most Voted
            </button>
            <button
              onClick={() => setSort("newest")}
              className={`px-2 py-1 text-xs font-semibold transition-colors ${
                sort === "newest" ? "bg-code-blue text-black" : "border border-medium-gray/30 text-medium-gray"
              }`}
            >
              Newest
            </button>
          </div>
        </div>

        {showForm && (
          <div className="border border-medium-gray/20 p-4 mb-6 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green">{"// submit feedback"}</h2>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your idea or issue?"
              className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe in detail (optional)"
              rows={3}
              className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray resize-y"
            />
            <div className="flex gap-2">
              {TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3 py-1 text-xs border transition-colors ${
                    type === t ? typeColors[t] : "border-medium-gray/30 text-medium-gray"
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <button
              onClick={submitFeedback}
              disabled={submitting || !title.trim()}
              className="px-4 py-2 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-medium-gray">Loading...</p>
        ) : items.length === 0 ? (
          <div className="border border-medium-gray/20 p-8 text-center">
            <p className="text-sm text-medium-gray">No feedback yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="border border-medium-gray/20 p-4 flex gap-4">
                <button
                  onClick={() => vote(item.id)}
                  className="shrink-0 w-14 h-14 border border-medium-gray/30 flex flex-col items-center justify-center hover:border-code-green/50 transition-colors"
                >
                  <span className="text-xs text-code-green">^</span>
                  <span className="text-sm font-bold text-light-gray">{item.vote_count}</span>
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-1.5 py-0.5 border ${typeColors[item.type] || "border-medium-gray/30 text-medium-gray"}`}>
                      {item.type}
                    </span>
                    <span className={`text-xs capitalize ${statusColors[item.status] || "text-medium-gray"}`}>
                      {item.status.replace("-", " ")}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-light-gray">{item.title}</h3>
                  {item.description && (
                    <p className="text-xs text-medium-gray mt-1 line-clamp-2">{item.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-xs text-medium-gray">
                    <span className="text-code-blue">{item.author_name}</span>
                    <span>{formatTimeAgo(item.created_at)}</span>
                    <span>{item.comment_count} comments</span>
                  </div>
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
