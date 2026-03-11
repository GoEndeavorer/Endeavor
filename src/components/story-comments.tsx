"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { formatTimeAgo } from "@/lib/time";

type Comment = {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorImage: string | null;
  createdAt: string;
};

export function StoryComments({ storyId }: { storyId: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [posting, setPosting] = useState(false);

  const fetchComments = useCallback(() => {
    fetch(`/api/stories/${storyId}/comments`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setComments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [storyId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const postComment = async () => {
    if (!content.trim() || posting) return;
    setPosting(true);

    try {
      const res = await fetch(`/api/stories/${storyId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim() }),
      });

      if (res.ok) {
        const newComment = await res.json();
        setComments([newComment, ...comments]);
        setContent("");
      }
    } catch {
      // ignore
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="mt-12 border-t border-medium-gray/20 pt-8">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
        {"// comments"}{" "}
        <span className="text-medium-gray font-normal">({comments.length})</span>
      </h3>

      {/* Comment form */}
      {session ? (
        <div className="mb-6">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Share your thoughts..."
            className="w-full border border-medium-gray/30 bg-transparent px-4 py-3 text-sm text-white placeholder:text-medium-gray/50 focus:border-code-green focus:outline-none"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] text-medium-gray">
              {content.length}/2000
            </span>
            <button
              onClick={postComment}
              disabled={!content.trim() || posting}
              className="border border-code-green px-4 py-1.5 text-xs font-semibold text-code-green transition-colors hover:bg-code-green/10 disabled:opacity-30"
            >
              {posting ? "Posting..." : "Post Comment"}
            </button>
          </div>
        </div>
      ) : (
        <p className="mb-6 text-sm text-medium-gray">
          <Link href="/login" className="text-code-green hover:underline">
            Log in
          </Link>{" "}
          to leave a comment.
        </p>
      )}

      {/* Comments list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="h-8 w-8 shrink-0 animate-pulse bg-medium-gray/10" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-24 animate-pulse bg-medium-gray/10" />
                <div className="h-4 w-full animate-pulse bg-medium-gray/10" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="py-4 text-center text-sm text-medium-gray">
          No comments yet. Be the first to share your thoughts.
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <Link
                href={`/users/${c.authorId}`}
                className="flex h-8 w-8 shrink-0 items-center justify-center bg-code-blue/10 text-xs font-bold text-code-blue"
              >
                {c.authorName.charAt(0).toUpperCase()}
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/users/${c.authorId}`}
                    className="text-sm font-semibold hover:text-code-green transition-colors"
                  >
                    {c.authorName}
                  </Link>
                  <span className="text-[10px] text-medium-gray">
                    {formatTimeAgo(c.createdAt)}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-light-gray leading-relaxed">
                  {c.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
