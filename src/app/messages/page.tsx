"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { formatTimeAgo } from "@/lib/time";

type Conversation = {
  partner_id: string;
  partner_name: string;
  partner_image: string | null;
  last_message: string;
  last_message_at: string;
  sender_id: string;
  unread_count: number;
};

type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  read: boolean;
  created_at: string;
};

type Partner = {
  id: string;
  name: string;
  image: string | null;
};

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const initialPartnerId = searchParams.get("to");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activePartner, setActivePartner] = useState<Partner | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Fetch current user
  useEffect(() => {
    fetch("/api/profile").then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setUserId(data.id);
      }
    });
  }, []);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    const res = await fetch("/api/messages");
    if (res.ok) {
      setConversations(await res.json());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // Open thread with partner
  const openThread = useCallback(async (partnerId: string) => {
    setLoadingThread(true);
    setShowSidebar(false);
    const res = await fetch(`/api/messages/${partnerId}`);
    if (res.ok) {
      const data = await res.json();
      setActivePartner(data.partner);
      setMessages(data.messages);
    }
    setLoadingThread(false);
  }, []);

  // Auto-open thread from URL param
  useEffect(() => {
    if (initialPartnerId) {
      openThread(initialPartnerId);
    }
  }, [initialPartnerId, openThread]);

  // Poll active thread
  useEffect(() => {
    if (!activePartner) return;
    const interval = setInterval(async () => {
      const res = await fetch(`/api/messages/${activePartner.id}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [activePartner]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !activePartner || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId: activePartner.id, content: newMessage.trim() }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, {
          id: msg.id,
          sender_id: msg.senderId,
          recipient_id: msg.recipientId,
          content: msg.content,
          read: false,
          created_at: msg.createdAt,
        }]);
        setNewMessage("");
        fetchConversations();
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <AppHeader breadcrumb={{ label: "Messages", href: "/messages" }} />
      <main id="main-content" className="mx-auto max-w-6xl px-4 pt-24 pb-16">
        <div className="flex h-[calc(100vh-200px)] min-h-[500px] border border-medium-gray/20">
          {/* Sidebar */}
          <div className={`w-full shrink-0 border-r border-medium-gray/20 md:w-80 ${!showSidebar && activePartner ? "hidden md:block" : ""}`}>
            <div className="border-b border-medium-gray/20 p-4">
              <h1 className="text-sm font-bold uppercase tracking-widest text-code-green">Messages</h1>
            </div>
            <div className="overflow-y-auto" style={{ height: "calc(100% - 57px)" }}>
              {loading ? (
                <div className="space-y-0">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse border-b border-medium-gray/10 p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 bg-medium-gray/10" />
                        <div className="flex-1">
                          <div className="mb-1 h-3 w-24 bg-medium-gray/10" />
                          <div className="h-2.5 w-40 bg-medium-gray/10" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-medium-gray">No conversations yet</p>
                  <p className="mt-1 text-xs text-medium-gray/60">
                    Visit a{" "}
                    <Link href="/people" className="text-code-blue hover:underline">
                      user&apos;s profile
                    </Link>{" "}
                    to start messaging
                  </p>
                </div>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.partner_id}
                    onClick={() => openThread(c.partner_id)}
                    className={`flex w-full items-center gap-3 border-b border-medium-gray/10 p-4 text-left transition-colors hover:bg-medium-gray/5 ${
                      activePartner?.id === c.partner_id ? "bg-medium-gray/10" : ""
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-code-blue/10 text-sm font-bold text-code-blue">
                      {c.partner_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className={`truncate text-sm font-semibold ${c.unread_count > 0 ? "text-white" : ""}`}>
                          {c.partner_name}
                        </p>
                        <span className="shrink-0 text-[10px] text-medium-gray">
                          {formatTimeAgo(c.last_message_at)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className={`truncate text-xs ${c.unread_count > 0 ? "text-white" : "text-medium-gray"}`}>
                          {c.sender_id === userId ? "You: " : ""}
                          {c.last_message}
                        </p>
                        {c.unread_count > 0 && (
                          <span className="shrink-0 flex h-4 min-w-[16px] items-center justify-center bg-code-green px-1 text-[10px] font-bold text-black">
                            {c.unread_count}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Thread */}
          <div className={`flex flex-1 flex-col ${showSidebar && !activePartner ? "hidden md:flex" : ""}`}>
            {activePartner ? (
              <>
                <div className="flex items-center gap-3 border-b border-medium-gray/20 p-4">
                  <button
                    onClick={() => { setShowSidebar(true); setActivePartner(null); }}
                    className="text-medium-gray hover:text-white md:hidden"
                  >
                    &larr;
                  </button>
                  <Link
                    href={`/users/${activePartner.id}`}
                    className="flex h-8 w-8 items-center justify-center bg-code-blue/10 text-xs font-bold text-code-blue hover:bg-code-blue/20"
                  >
                    {activePartner.name.charAt(0).toUpperCase()}
                  </Link>
                  <Link href={`/users/${activePartner.id}`} className="text-sm font-semibold hover:text-code-blue">
                    {activePartner.name}
                  </Link>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loadingThread ? (
                    <div className="space-y-3">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className={`flex ${i % 2 === 0 ? "" : "justify-end"}`}>
                          <div className="animate-pulse">
                            <div className={`h-8 ${i % 2 === 0 ? "w-48" : "w-36"} bg-medium-gray/10`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-sm text-medium-gray">
                        Start your conversation with {activePartner.name}
                      </p>
                    </div>
                  ) : (
                    messages.map((msg, i) => {
                      const isMine = msg.sender_id === userId;
                      const prevMsg = i > 0 ? messages[i - 1] : null;
                      const showTime = !prevMsg || (new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime()) > 5 * 60 * 1000;
                      const sameSender = prevMsg?.sender_id === msg.sender_id && !showTime;

                      return (
                        <div key={msg.id}>
                          {showTime && (
                            <p className="my-4 text-center text-[10px] text-medium-gray/50">
                              {new Date(msg.created_at).toLocaleString()}
                            </p>
                          )}
                          <div className={`flex ${isMine ? "justify-end" : ""} ${sameSender ? "" : "mt-2"}`}>
                            <div
                              className={`max-w-[75%] px-3 py-2 text-sm ${
                                isMine
                                  ? "bg-code-green/15 text-white"
                                  : "bg-code-blue/10 text-white"
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

                <form onSubmit={handleSend} className="border-t border-medium-gray/20 p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      maxLength={2000}
                      className="flex-1 border border-medium-gray/30 bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-code-green"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="border border-code-green bg-code-green px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-transparent hover:text-code-green disabled:opacity-30"
                    >
                      Send
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-medium-gray">Select a conversation</p>
                  <p className="mt-1 text-xs text-medium-gray/50">or visit a user profile to start one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
