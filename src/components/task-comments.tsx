"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/time";
import { useToast } from "@/components/toast";

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  authorId: string;
  authorName: string;
  authorImage: string | null;
};

export function TaskComments({ taskId }: { taskId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!expanded) return;
    fetch(`/api/tasks/${taskId}/comments`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setComments(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [taskId, expanded]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newComment.trim() || posting) return;

    setPosting(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      if (res.ok) {
        const comment = await res.json();
        setComments((prev) => [...prev, comment]);
        setNewComment("");
      } else {
        toast("Failed to post comment", "error");
      }
    } catch {
      toast("Failed to post comment", "error");
    } finally {
      setPosting(false);
    }
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="text-[10px] text-medium-gray hover:text-code-blue transition-colors"
      >
        comments
      </button>
    );
  }

  return (
    <div className="mt-2 border-t border-medium-gray/10 pt-2">
      {loading ? (
        <p className="text-[10px] text-medium-gray">loading...</p>
      ) : (
        <>
          {comments.length > 0 && (
            <div className="space-y-1.5 mb-2">
              {comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2">
                  <Link
                    href={`/users/${c.authorId}`}
                    className="text-[10px] font-semibold text-code-blue hover:text-code-green shrink-0"
                  >
                    {c.authorName}
                  </Link>
                  <p className="text-[10px] text-light-gray flex-1">{c.content}</p>
                  <span className="text-[9px] text-medium-gray shrink-0">
                    {formatTimeAgo(c.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-1">
            <input
              ref={inputRef}
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-transparent border border-medium-gray/20 px-2 py-1 text-[10px] text-white outline-none focus:border-code-green/50 placeholder:text-medium-gray"
            />
            <button
              type="submit"
              disabled={posting || !newComment.trim()}
              className="border border-medium-gray/20 px-2 py-1 text-[10px] text-medium-gray hover:text-code-green hover:border-code-green/50 disabled:opacity-50 transition-colors"
            >
              {posting ? "..." : "Post"}
            </button>
          </form>
        </>
      )}
    </div>
  );
}
