"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/time";

type Endorsement = {
  id: string;
  content: string;
  rating: number;
  createdAt: string;
  authorId: string;
  authorName: string;
  authorImage: string | null;
};

export function Endorsements({
  endeavorId,
  isMember,
}: {
  endeavorId: string;
  isMember: boolean;
}) {
  const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/endorsements`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setEndorsements)
      .catch(() => {});
  }, [endeavorId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);
    setError("");

    const res = await fetch(`/api/endeavors/${endeavorId}/endorsements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content.trim(), rating }),
    });

    if (res.ok) {
      const created = await res.json();
      setEndorsements((prev) => [created, ...prev]);
      setContent("");
      setShowForm(false);
    } else {
      const data = await res.json();
      setError(data.error || "Failed to submit");
    }
    setSubmitting(false);
  }

  const avgRating =
    endorsements.length > 0
      ? (endorsements.reduce((sum, e) => sum + e.rating, 0) / endorsements.length).toFixed(1)
      : null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// endorsements"} {endorsements.length > 0 && `(${endorsements.length})`}
        </h3>
        {avgRating && (
          <span className="text-sm text-yellow-400">
            {"★".repeat(Math.round(Number(avgRating)))} {avgRating}
          </span>
        )}
      </div>

      {isMember && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-4 w-full border border-medium-gray/30 py-2 text-xs text-medium-gray hover:border-code-green hover:text-code-green transition-colors"
        >
          Write an endorsement
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 border border-medium-gray/20 p-4">
          <div className="mb-3">
            <label className="mb-1 block text-xs text-medium-gray">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={`text-lg ${n <= rating ? "text-yellow-400" : "text-medium-gray/30"}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your experience..."
            maxLength={500}
            rows={3}
            className="mb-2 w-full border border-medium-gray/30 bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-code-green"
          />
          {error && <p className="mb-2 text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="border border-code-green px-4 py-1.5 text-xs font-bold text-code-green hover:bg-code-green hover:text-black disabled:opacity-50"
            >
              {submitting ? "..." : "Submit"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-1.5 text-xs text-medium-gray hover:text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {endorsements.length === 0 && !showForm ? (
        <p className="text-sm text-medium-gray">No endorsements yet.</p>
      ) : (
        <div className="space-y-3">
          {endorsements.map((e) => (
            <div key={e.id} className="border border-medium-gray/20 p-3">
              <div className="mb-1 flex items-center justify-between">
                <Link
                  href={`/users/${e.authorId}`}
                  className="text-sm font-semibold hover:text-code-blue"
                >
                  {e.authorName}
                </Link>
                <span className="text-xs text-yellow-400">
                  {"★".repeat(e.rating)}
                </span>
              </div>
              <p className="text-sm text-light-gray leading-relaxed">{e.content}</p>
              <p className="mt-1 text-[10px] text-medium-gray">
                {formatTimeAgo(e.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
