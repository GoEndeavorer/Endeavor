"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";

type Review = {
  id: string;
  content: string;
  rating: number;
  creatorName: string;
  creatorId: string;
  createdAt: string;
};

function StarRating({ value }: { value: number }) {
  return (
    <span className="font-mono text-code-green tracking-wide">
      {"*".repeat(value)}
      <span className="text-medium-gray/30">{"*".repeat(5 - value)}</span>
    </span>
  );
}

export function EndeavorReviews({ endeavorId }: { endeavorId: string }) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/reviews`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setReviews(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [endeavorId]);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const alreadyReviewed =
    session?.user && reviews.some((r) => r.creatorId === session.user.id);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/endeavors/${endeavorId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim(), rating }),
      });

      if (res.ok) {
        const created = await res.json();
        setReviews((prev) => [created, ...prev]);
        setContent("");
        setRating(5);
        toast("Review submitted", "success");
      } else {
        const data = await res.json();
        toast(data.error || "Failed to submit review", "error");
      }
    } catch {
      toast("Network error", "error");
    }

    setSubmitting(false);
  }

  return (
    <div className="font-mono">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// reviews"} {reviews.length > 0 && `(${reviews.length})`}
        </h3>
        {reviews.length > 0 && (
          <span className="text-sm text-code-blue">
            <StarRating value={Math.round(avgRating)} />{" "}
            <span className="text-medium-gray">{avgRating.toFixed(1)}/5</span>
          </span>
        )}
      </div>

      {/* Review form or login prompt */}
      {session?.user ? (
        !alreadyReviewed && (
          <form
            onSubmit={handleSubmit}
            className="mb-6 border border-medium-gray/20 p-4"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-medium-gray">
              Write a review
            </p>
            <div className="mb-3">
              <label className="mb-1 block text-xs text-medium-gray">
                Rating
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className={`px-1 text-lg font-mono ${
                      n <= rating ? "text-code-green" : "text-medium-gray/30"
                    }`}
                  >
                    *
                  </button>
                ))}
                <span className="ml-2 self-center text-xs text-medium-gray">
                  {rating}/5
                </span>
              </div>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts..."
              maxLength={1000}
              rows={3}
              className="mb-3 w-full border border-medium-gray/30 bg-transparent px-3 py-2 font-mono text-sm text-white outline-none placeholder:text-medium-gray/50 focus:border-code-green"
            />
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="border border-code-green px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-code-green hover:bg-code-green hover:text-black disabled:opacity-50 transition-colors"
            >
              {submitting ? "submitting..." : "submit review"}
            </button>
          </form>
        )
      ) : (
        <div className="mb-6 border border-medium-gray/20 p-4 text-center">
          <p className="text-sm text-medium-gray">
            <Link
              href="/sign-in"
              className="text-code-blue hover:underline"
            >
              Sign in
            </Link>{" "}
            to write a review.
          </p>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <p className="text-sm text-medium-gray">Loading reviews...</p>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-medium-gray">No reviews yet.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border border-medium-gray/20 p-3"
            >
              <div className="mb-1 flex items-center justify-between">
                <Link
                  href={`/users/${review.creatorId}`}
                  className="text-sm font-semibold text-white hover:text-code-blue transition-colors"
                >
                  {review.creatorName}
                </Link>
                <StarRating value={review.rating} />
              </div>
              <p className="text-sm text-light-gray leading-relaxed">
                {review.content}
              </p>
              <p className="mt-1 text-[10px] text-medium-gray">
                {formatTimeAgo(review.createdAt)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
