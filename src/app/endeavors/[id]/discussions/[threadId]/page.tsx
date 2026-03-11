"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { MarkdownText } from "@/components/markdown-text";
import { formatTimeAgo } from "@/lib/time";
import { useToast } from "@/components/toast";

type Discussion = {
  id: string;
  content: string;
  createdAt: string;
  parentId: string | null;
  authorId: string;
  authorName: string;
  authorImage: string | null;
  pinned?: boolean;
};

type ReactionData = {
  counts: Record<string, number>;
  userReactions: string[];
};

const EMOJI_MAP: Record<string, string> = {
  like: "\u{1F44D}",
  heart: "\u2764\uFE0F",
  fire: "\u{1F525}",
  thumbsup: "\u{1F44D}",
  thumbsdown: "\u{1F44E}",
  celebrate: "\u{1F389}",
};

const REACTION_EMOJIS = ["like", "heart", "fire", "celebrate", "thumbsdown"];

export default function DiscussionThreadPage({
  params,
}: {
  params: Promise<{ id: string; threadId: string }>;
}) {
  const { id, threadId } = use(params);
  const { data: session } = useSession();
  const { toast } = useToast();

  const [thread, setThread] = useState<Discussion | null>(null);
  const [replies, setReplies] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyContent, setReplyContent] = useState("");
  const [sending, setSending] = useState(false);
  const [reactions, setReactions] = useState<Record<string, ReactionData>>({});
  const [endeavorTitle, setEndeavorTitle] = useState("");

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const fetchReactions = useCallback(
    async (discussionId: string) => {
      try {
        const res = await fetch(`/api/discussions/${discussionId}/reactions`);
        if (res.ok) {
          const data: ReactionData = await res.json();
          setReactions((prev) => ({ ...prev, [discussionId]: data }));
        }
      } catch {
        // silently ignore reaction fetch errors
      }
    },
    []
  );

  const fetchThread = useCallback(async () => {
    try {
      const res = await fetch(`/api/endeavors/${id}/discussions?limit=500`);
      if (!res.ok) {
        toast("Failed to load discussion thread", "error");
        setLoading(false);
        return;
      }
      const all: Discussion[] = await res.json();

      const root = all.find((d) => d.id === threadId);
      if (!root) {
        toast("Thread not found", "error");
        setLoading(false);
        return;
      }
      setThread(root);

      const threadReplies = all
        .filter((d) => d.parentId === threadId)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      setReplies(threadReplies);

      // Fetch reactions for root and all replies
      fetchReactions(root.id);
      threadReplies.forEach((r) => fetchReactions(r.id));
    } catch {
      toast("Failed to load discussion thread", "error");
    } finally {
      setLoading(false);
    }
  }, [id, threadId, toast, fetchReactions]);

  // Fetch endeavor title for breadcrumb
  useEffect(() => {
    fetch(`/api/endeavors/${id}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.title) setEndeavorTitle(data.title);
      })
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    fetchThread();
  }, [fetchThread]);

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyContent.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/endeavors/${id}/discussions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent.trim(), parentId: threadId }),
      });
      if (res.ok) {
        const newReply: Discussion = await res.json();
        setReplies((prev) => [...prev, newReply]);
        setReplyContent("");
        toast("Reply posted", "success");
      } else {
        toast("Failed to post reply", "error");
      }
    } catch {
      toast("Failed to post reply", "error");
    } finally {
      setSending(false);
    }
  }

  async function handleEdit(discussionId: string) {
    if (!editContent.trim()) return;
    try {
      const res = await fetch(`/api/discussions/${discussionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editContent.trim() }),
      });
      if (res.ok) {
        const updatedContent = editContent.trim();
        if (discussionId === threadId) {
          setThread((prev) =>
            prev ? { ...prev, content: updatedContent } : prev
          );
        } else {
          setReplies((prev) =>
            prev.map((r) =>
              r.id === discussionId ? { ...r, content: updatedContent } : r
            )
          );
        }
        setEditingId(null);
        setEditContent("");
        toast("Message updated", "success");
      } else {
        toast("Failed to update message", "error");
      }
    } catch {
      toast("Failed to update message", "error");
    }
  }

  async function toggleReaction(discussionId: string, emoji: string) {
    try {
      const res = await fetch(`/api/discussions/${discussionId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
      if (res.ok) {
        fetchReactions(discussionId);
      }
    } catch {
      // silently ignore
    }
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen">
        <AppHeader
          breadcrumb={
            endeavorTitle
              ? { label: endeavorTitle, href: `/endeavors/${id}/dashboard` }
              : undefined
          }
        />
        <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
          <div className="mb-6 h-4 w-40 animate-pulse bg-medium-gray/10" />
          <div className="mb-8 border border-medium-gray/20 p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse bg-medium-gray/20" />
              <div className="space-y-2">
                <div className="h-4 w-28 animate-pulse bg-medium-gray/10" />
                <div className="h-3 w-20 animate-pulse bg-medium-gray/10" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse bg-medium-gray/10" />
              <div className="h-4 w-3/4 animate-pulse bg-medium-gray/10" />
            </div>
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border border-medium-gray/20 p-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-7 w-7 animate-pulse bg-medium-gray/20" />
                  <div className="h-3 w-24 animate-pulse bg-medium-gray/10" />
                </div>
                <div className="h-3 w-full animate-pulse bg-medium-gray/10" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // Thread not found
  if (!thread) {
    return (
      <div className="min-h-screen">
        <AppHeader
          breadcrumb={
            endeavorTitle
              ? { label: endeavorTitle, href: `/endeavors/${id}/dashboard` }
              : undefined
          }
        />
        <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
          <div className="border border-medium-gray/20 p-12 text-center">
            <p className="mb-4 text-medium-gray">Thread not found.</p>
            <Link
              href={`/endeavors/${id}/dashboard`}
              className="text-sm text-code-blue hover:text-code-green"
            >
              Back to dashboard
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader
        breadcrumb={
          endeavorTitle
            ? { label: endeavorTitle, href: `/endeavors/${id}/dashboard` }
            : undefined
        }
      />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        {/* Back link */}
        <Link
          href={`/endeavors/${id}/dashboard`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-medium-gray transition-colors hover:text-code-green"
        >
          &larr; Back to discussions
        </Link>

        {/* Top-level message */}
        <div className="mt-4 border border-medium-gray/20 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {thread.authorImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={thread.authorImage}
                  alt={thread.authorName}
                  className="h-10 w-10 object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center bg-code-green/20 text-sm font-bold text-code-green">
                  {thread.authorName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-semibold">{thread.authorName}</p>
                <p
                  className="text-xs text-medium-gray"
                  title={new Date(thread.createdAt).toLocaleString()}
                >
                  {formatTimeAgo(thread.createdAt)}
                </p>
              </div>
            </div>
            {thread.authorId === session?.user?.id && editingId !== thread.id && (
              <button
                onClick={() => {
                  setEditingId(thread.id);
                  setEditContent(thread.content);
                }}
                className="text-xs text-medium-gray hover:text-code-blue"
              >
                edit
              </button>
            )}
          </div>

          {editingId === thread.id ? (
            <div>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={4}
                className="mb-2 w-full border border-medium-gray/50 bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-code-green"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(thread.id)}
                  disabled={!editContent.trim()}
                  className="border border-code-green px-3 py-1 text-xs text-code-green hover:bg-code-green hover:text-black disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingId(null);
                    setEditContent("");
                  }}
                  className="px-3 py-1 text-xs text-medium-gray hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm leading-relaxed">
              <MarkdownText content={thread.content} />
            </div>
          )}

          {/* Reactions for thread root */}
          <ReactionBar
            discussionId={thread.id}
            reactions={reactions[thread.id]}
            onToggle={toggleReaction}
          />
        </div>

        {/* Replies section */}
        <div className="mt-8">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-medium-gray">
            {replies.length === 0
              ? "No replies yet"
              : `${replies.length} ${replies.length === 1 ? "Reply" : "Replies"}`}
          </h2>

          <div className="space-y-3">
            {replies.map((reply) => (
              <div
                key={reply.id}
                className="border border-medium-gray/20 p-4"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {reply.authorImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={reply.authorImage}
                        alt={reply.authorName}
                        className="h-7 w-7 object-cover"
                      />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center bg-code-blue/20 text-xs font-bold text-code-blue">
                        {reply.authorName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-semibold">
                      {reply.authorName}
                    </span>
                    <span
                      className="text-xs text-medium-gray"
                      title={new Date(reply.createdAt).toLocaleString()}
                    >
                      {formatTimeAgo(reply.createdAt)}
                    </span>
                  </div>
                  {reply.authorId === session?.user?.id &&
                    editingId !== reply.id && (
                      <button
                        onClick={() => {
                          setEditingId(reply.id);
                          setEditContent(reply.content);
                        }}
                        className="text-xs text-medium-gray hover:text-code-blue"
                      >
                        edit
                      </button>
                    )}
                </div>

                {editingId === reply.id ? (
                  <div>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={3}
                      className="mb-2 w-full border border-medium-gray/50 bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-code-green"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(reply.id)}
                        disabled={!editContent.trim()}
                        className="border border-code-green px-3 py-1 text-xs text-code-green hover:bg-code-green hover:text-black disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditContent("");
                        }}
                        className="px-3 py-1 text-xs text-medium-gray hover:text-white"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm">
                    <MarkdownText content={reply.content} />
                  </div>
                )}

                {/* Reactions for reply */}
                <ReactionBar
                  discussionId={reply.id}
                  reactions={reactions[reply.id]}
                  onToggle={toggleReaction}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Reply form */}
        {session && (
          <form onSubmit={handleSendReply} className="mt-8">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-medium-gray">
              Write a reply
            </label>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              rows={4}
              placeholder="Write your reply..."
              className="mb-2 w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
            />
            <button
              type="submit"
              disabled={sending || !replyContent.trim()}
              className="border border-code-green px-4 py-2 text-xs font-bold uppercase text-code-green transition-colors hover:bg-code-green hover:text-black disabled:opacity-50"
            >
              {sending ? "Sending..." : "Reply"}
            </button>
          </form>
        )}

        {!session && (
          <div className="mt-8 border border-medium-gray/20 p-6 text-center">
            <p className="mb-2 text-sm text-medium-gray">
              You must be logged in and a member to reply.
            </p>
            <Link
              href="/login"
              className="text-sm text-code-blue hover:text-code-green"
            >
              Log in
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

/* ── Reaction Bar Component ── */
function ReactionBar({
  discussionId,
  reactions,
  onToggle,
}: {
  discussionId: string;
  reactions: ReactionData | undefined;
  onToggle: (discussionId: string, emoji: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const counts = reactions?.counts || {};
  const userReactions = reactions?.userReactions || [];
  const hasAny = Object.values(counts).some((c) => c > 0);

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {/* Existing reactions */}
      {Object.entries(counts)
        .filter(([, count]) => count > 0)
        .map(([emoji, count]) => (
          <button
            key={emoji}
            onClick={() => onToggle(discussionId, emoji)}
            className={`flex items-center gap-1 border px-2 py-0.5 text-xs transition-colors ${
              userReactions.includes(emoji)
                ? "border-code-green/50 bg-code-green/10 text-code-green"
                : "border-medium-gray/30 text-medium-gray hover:border-medium-gray/60"
            }`}
          >
            <span>{EMOJI_MAP[emoji] || emoji}</span>
            <span>{count}</span>
          </button>
        ))}

      {/* Add reaction button */}
      <div className="relative">
        <button
          onClick={() => setPickerOpen(!pickerOpen)}
          className={`flex h-6 w-6 items-center justify-center border border-medium-gray/20 text-xs text-medium-gray transition-colors hover:border-medium-gray/50 hover:text-white ${
            !hasAny ? "ml-0" : ""
          }`}
          title="Add reaction"
        >
          +
        </button>
        {pickerOpen && (
          <div className="absolute bottom-full left-0 z-10 mb-1 flex gap-1 border border-medium-gray/30 bg-black p-1.5">
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onToggle(discussionId, emoji);
                  setPickerOpen(false);
                }}
                className="px-1.5 py-0.5 text-sm transition-colors hover:bg-medium-gray/20"
                title={emoji}
              >
                {EMOJI_MAP[emoji]}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
