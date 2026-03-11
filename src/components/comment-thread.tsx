"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";

type Comment = {
  id: string;
  author_id: string;
  author_name: string;
  author_image: string | null;
  body: string;
  parent_id: string | null;
  vote_count: number;
  created_at: string;
};

type CommentThreadProps = {
  endeavorId: string;
};

export function CommentThread({ endeavorId }: CommentThreadProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/comments`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setComments)
      .finally(() => setLoading(false));
  }, [endeavorId]);

  async function postComment() {
    if (!body.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/endeavors/${endeavorId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: body.trim(), parentId: replyTo }),
    });
    if (res.ok) {
      const comment = await res.json();
      setComments((prev) => [
        ...prev,
        { ...comment, author_name: session!.user.name, author_image: null },
      ]);
      setBody("");
      setReplyTo(null);
      toast("Comment posted!", "success");
    }
    setSubmitting(false);
  }

  // Build threaded structure
  const topLevel = comments.filter((c) => !c.parent_id);
  const replies = (parentId: string) => comments.filter((c) => c.parent_id === parentId);

  function renderComment(comment: Comment, depth = 0) {
    return (
      <div key={comment.id} style={{ marginLeft: depth * 16 }} className="border-l border-medium-gray/10 pl-3 mb-2">
        <div className="flex items-center gap-2 mb-1">
          <Link href={`/users/${comment.author_id}`} className="text-xs text-code-blue hover:text-code-green">
            {comment.author_name}
          </Link>
          <span className="text-xs text-medium-gray">{formatTimeAgo(comment.created_at)}</span>
        </div>
        <p className="text-sm text-light-gray/80 whitespace-pre-wrap">{comment.body}</p>
        {session && depth < 3 && (
          <button
            onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
            className="text-xs text-medium-gray hover:text-code-green mt-1 transition-colors"
          >
            {replyTo === comment.id ? "Cancel" : "Reply"}
          </button>
        )}
        {replyTo === comment.id && (
          <div className="mt-2 flex gap-2">
            <input
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={`Reply to ${comment.author_name}...`}
              className="flex-1 border border-medium-gray/30 bg-black px-2 py-1 text-xs text-white placeholder:text-medium-gray"
              onKeyDown={(e) => e.key === "Enter" && postComment()}
            />
            <button
              onClick={postComment}
              disabled={submitting || !body.trim()}
              className="px-2 py-1 text-xs border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors disabled:opacity-50"
            >
              Reply
            </button>
          </div>
        )}
        {replies(comment.id).map((r) => renderComment(r, depth + 1))}
      </div>
    );
  }

  if (loading) return <div className="text-xs text-medium-gray">Loading comments...</div>;

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-code-green mb-3">
        {"// comments"} ({comments.length})
      </h3>

      {topLevel.length === 0 ? (
        <p className="text-xs text-medium-gray mb-3">No comments yet.</p>
      ) : (
        <div className="mb-3">{topLevel.map((c) => renderComment(c))}</div>
      )}

      {session && !replyTo && (
        <div className="flex gap-2">
          <input
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 border border-medium-gray/30 bg-black px-3 py-1.5 text-sm text-white placeholder:text-medium-gray"
            onKeyDown={(e) => e.key === "Enter" && postComment()}
          />
          <button
            onClick={postComment}
            disabled={submitting || !body.trim()}
            className="px-3 py-1.5 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors disabled:opacity-50"
          >
            {submitting ? "..." : "Post"}
          </button>
        </div>
      )}
    </div>
  );
}
