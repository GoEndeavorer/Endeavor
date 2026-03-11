"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";

type Review = {
  id: string;
  reviewer_id: string;
  reviewer_name: string;
  rating: number;
  title: string | null;
  body: string | null;
  helpful_count: number;
  created_at: string;
};

type ReviewSectionProps = {
  endeavorId: string;
};

function Stars({ rating, interactive, onChange }: { rating: number; interactive?: boolean; onChange?: (r: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          onClick={() => interactive && onChange?.(n)}
          className={`text-sm ${
            n <= rating ? "text-yellow-400" : "text-medium-gray/30"
          } ${interactive ? "hover:text-yellow-400 cursor-pointer" : "cursor-default"}`}
          disabled={!interactive}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function ReviewSection({ endeavorId }: ReviewSectionProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<{ avg_rating: string; total_reviews: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/reviews`)
      .then((r) => (r.ok ? r.json() : { reviews: [], summary: null }))
      .then((data) => {
        setReviews(data.reviews);
        setSummary(data.summary);
      })
      .finally(() => setLoading(false));
  }, [endeavorId]);

  async function submitReview() {
    if (rating === 0) return;
    setSubmitting(true);
    const res = await fetch(`/api/endeavors/${endeavorId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, title: title || undefined, body: body || undefined }),
    });
    if (res.ok) {
      const review = await res.json();
      setReviews((prev) => {
        const existing = prev.findIndex((r) => r.reviewer_id === session?.user?.id);
        if (existing >= 0) {
          return prev.map((r, i) => (i === existing ? { ...review, reviewer_name: session!.user.name } : r));
        }
        return [{ ...review, reviewer_name: session!.user.name }, ...prev];
      });
      setShowForm(false);
      setRating(0);
      setTitle("");
      setBody("");
      toast("Review submitted!", "success");
    }
    setSubmitting(false);
  }

  if (loading) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// reviews"}
          </h3>
          {summary && Number(summary.total_reviews) > 0 && (
            <span className="text-xs text-medium-gray">
              {Number(summary.avg_rating).toFixed(1)} ★ ({summary.total_reviews})
            </span>
          )}
        </div>
        {session && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs text-medium-gray hover:text-code-green transition-colors"
          >
            {showForm ? "Cancel" : "Write Review"}
          </button>
        )}
      </div>

      {showForm && (
        <div className="border border-medium-gray/20 p-3 mb-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-medium-gray">Rating:</span>
            <Stars rating={rating} interactive onChange={setRating} />
          </div>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Review title (optional)"
            className="w-full border border-medium-gray/30 bg-black px-2 py-1.5 text-sm text-white placeholder:text-medium-gray"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Your review (optional)"
            rows={3}
            className="w-full border border-medium-gray/30 bg-black px-2 py-1.5 text-sm text-white placeholder:text-medium-gray resize-y"
          />
          <button
            onClick={submitReview}
            disabled={submitting || rating === 0}
            className="px-3 py-1 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="text-xs text-medium-gray">No reviews yet.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="border border-medium-gray/10 p-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Stars rating={review.rating} />
                  {review.title && (
                    <span className="text-sm font-semibold text-light-gray">{review.title}</span>
                  )}
                </div>
                <span className="text-xs text-medium-gray">{formatTimeAgo(review.created_at)}</span>
              </div>
              {review.body && (
                <p className="text-xs text-light-gray/80 mb-1">{review.body}</p>
              )}
              <Link href={`/users/${review.reviewer_id}`} className="text-xs text-code-blue hover:text-code-green">
                {review.reviewer_name}
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
