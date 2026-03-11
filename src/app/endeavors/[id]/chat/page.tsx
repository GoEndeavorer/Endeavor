"use client";

import { useState, useEffect, useRef, useCallback, use } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { formatTimeAgo } from "@/lib/time";

type Message = {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorImage: string | null;
  createdAt: string;
};

export default function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: endeavorId } = use(params);
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Fetch endeavor title
  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setTitle(data.title);
      })
      .catch(() => {});
  }, [endeavorId]);

  // Fetch messages
  const fetchMessages = useCallback(() => {
    fetch(`/api/endeavors/${endeavorId}/messages`)
      .then((r) => (r.ok ? r.json() : { messages: [] }))
      .then((data) => {
        setMessages(data.messages || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [endeavorId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/endeavors/${endeavorId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: input.trim() }),
      });

      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        setInput("");
      }
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Chat", href: `/endeavors/${endeavorId}/chat` }} />
        <div className="mx-auto max-w-4xl px-4 pt-24 pb-16 text-center">
          <p className="text-medium-gray">
            <Link href="/login" className="text-code-green hover:underline">Log in</Link> to access chat.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader breadcrumb={{ label: "Chat", href: `/endeavors/${endeavorId}/chat` }} />

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 pt-20 pb-4">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between border-b border-medium-gray/20 pb-3">
          <div>
            <h1 className="text-lg font-bold">
              {title ? `${title} — Chat` : "Team Chat"}
            </h1>
            <p className="text-xs text-medium-gray">
              {messages.length} messages
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/endeavors/${endeavorId}/dashboard`}
              className="text-xs text-medium-gray hover:text-code-green"
            >
              Dashboard
            </Link>
            <Link
              href={`/endeavors/${endeavorId}`}
              className="text-xs text-medium-gray hover:text-code-green"
            >
              Details
            </Link>
          </div>
        </div>

        {/* Messages area */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto space-y-1 pb-4"
          style={{ maxHeight: "calc(100vh - 220px)" }}
        >
          {loading ? (
            <div className="space-y-3 py-8">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-8 w-8 shrink-0 animate-pulse bg-medium-gray/10" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-24 animate-pulse bg-medium-gray/10" />
                    <div className="h-4 w-2/3 animate-pulse bg-medium-gray/10" />
                  </div>
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center py-20">
              <div className="text-center">
                <p className="text-2xl mb-2">{"{ }"}</p>
                <p className="text-sm text-medium-gray">
                  No messages yet. Start the conversation!
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMe = msg.authorId === session.user.id;
              const showAuthor =
                i === 0 || messages[i - 1].authorId !== msg.authorId;
              const showTimestamp =
                i === 0 ||
                new Date(msg.createdAt).getTime() -
                  new Date(messages[i - 1].createdAt).getTime() >
                  300000;

              return (
                <div key={msg.id}>
                  {showTimestamp && (
                    <p className="py-2 text-center text-[10px] text-medium-gray/60">
                      {new Date(msg.createdAt).toLocaleString()}
                    </p>
                  )}
                  <div
                    className={`flex gap-2 py-0.5 ${isMe ? "flex-row-reverse" : ""}`}
                  >
                    {showAuthor ? (
                      <Link
                        href={`/users/${msg.authorId}`}
                        className="flex h-7 w-7 shrink-0 items-center justify-center text-[10px] font-bold"
                        style={{
                          backgroundColor: isMe
                            ? "rgba(0,255,0,0.1)"
                            : "rgba(0,161,214,0.1)",
                          color: isMe ? "#00FF00" : "#00A1D6",
                        }}
                      >
                        {msg.authorName.charAt(0).toUpperCase()}
                      </Link>
                    ) : (
                      <div className="w-7 shrink-0" />
                    )}
                    <div
                      className={`max-w-[75%] ${isMe ? "text-right" : ""}`}
                    >
                      {showAuthor && (
                        <p
                          className={`mb-0.5 text-[10px] font-semibold ${
                            isMe ? "text-code-green" : "text-code-blue"
                          }`}
                        >
                          {msg.authorName}
                        </p>
                      )}
                      <div
                        className={`inline-block px-3 py-1.5 text-sm leading-relaxed ${
                          isMe
                            ? "bg-code-green/10 border border-code-green/20"
                            : "bg-white/5 border border-medium-gray/10"
                        }`}
                      >
                        {msg.content}
                      </div>
                      <p className="mt-0.5 text-[9px] text-medium-gray/40">
                        {formatTimeAgo(msg.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-medium-gray/20 pt-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              maxLength={2000}
              className="flex-1 border border-medium-gray/30 bg-transparent px-3 py-2 text-sm text-white placeholder:text-medium-gray/50 focus:border-code-green focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="border border-code-green bg-code-green/10 px-4 py-2 text-sm font-semibold text-code-green transition-colors hover:bg-code-green/20 disabled:opacity-30"
            >
              {sending ? "..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
