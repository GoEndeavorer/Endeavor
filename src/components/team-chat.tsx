"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { useToast } from "@/components/toast";

type Message = {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorImage: string | null;
  createdAt: string;
};

export function TeamChat({ endeavorId }: { endeavorId: string }) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/endeavors/${endeavorId}/messages`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.messages) {
        setMessages(data.messages);
      }
    } catch {
      // silent on poll failures
    } finally {
      setLoading(false);
    }
  }, [endeavorId]);

  // Initial fetch
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Poll every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || sending) return;

    setSending(true);
    setInput("");

    try {
      const res = await fetch(`/api/endeavors/${endeavorId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast(err.error || "Failed to send message", "error");
        setInput(text);
        return;
      }

      const msg: Message = await res.json();
      setMessages((prev) => [...prev, msg]);
    } catch {
      toast("Failed to send message", "error");
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);

    if (diffMin < 1) return "now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getInitial = (name: string | null) =>
    (name || "?").charAt(0).toUpperCase();

  const currentUserId = session?.user?.id;

  return (
    <div className="flex h-[400px] flex-col border border-medium-gray/20 bg-black font-mono">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-medium-gray/20 px-4 py-2">
        <span className="text-code-green text-xs">$</span>
        <span className="text-sm text-code-green">team_chat</span>
        <span className="ml-auto text-xs text-medium-gray">
          {messages.length} msg{messages.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <span className="animate-pulse text-xs text-medium-gray">
              loading messages...
            </span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <span className="text-xs text-medium-gray">
              No messages yet. Start the conversation.
            </span>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.authorId === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex gap-2 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center text-xs font-bold ${
                    isOwn
                      ? "bg-code-green/20 text-code-green"
                      : "bg-medium-gray/20 text-medium-gray"
                  }`}
                >
                  {getInitial(msg.authorName)}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[75%] space-y-1 ${isOwn ? "text-right" : "text-left"}`}
                >
                  <div className="flex items-baseline gap-2 text-[10px] text-medium-gray">
                    {isOwn ? (
                      <>
                        <span>{formatTime(msg.createdAt)}</span>
                        <span className="text-code-green">{msg.authorName}</span>
                      </>
                    ) : (
                      <>
                        <span>{msg.authorName}</span>
                        <span>{formatTime(msg.createdAt)}</span>
                      </>
                    )}
                  </div>
                  <div
                    className={`inline-block px-3 py-1.5 text-sm leading-relaxed ${
                      isOwn
                        ? "bg-code-green/10 text-code-green border border-code-green/20"
                        : "bg-medium-gray/10 text-light-gray border border-medium-gray/20"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-medium-gray/20 px-3 py-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <span className="text-code-green text-xs">&gt;</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            maxLength={2000}
            disabled={sending || !session}
            className="flex-1 bg-transparent text-sm text-light-gray placeholder:text-medium-gray/50 outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || !input.trim() || !session}
            className="border border-code-green/30 px-3 py-1 text-xs text-code-green transition-colors hover:bg-code-green/10 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            {sending ? "..." : "send"}
          </button>
        </form>
      </div>
    </div>
  );
}
