"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";
import { useSession } from "@/lib/auth-client";
import { formatTimeAgo } from "@/lib/time";

type Conversation = {
  conversation_id: string;
  conversation_created_at: string;
  last_message: string | null;
  last_message_at: string | null;
  last_message_sender_id: string | null;
  partner_id: string;
  partner_name: string;
  partner_image: string | null;
  unread_count: number;
};

type Message = {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
  sender_name: string;
  sender_image: string | null;
};

type Partner = {
  id: string;
  name: string;
  image: string | null;
};

type SearchUser = {
  id: string;
  name: string;
  image: string | null;
};

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const initialTo = searchParams.get("to");
  const { data: session } = useSession();
  const { toast } = useToast();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [activePartner, setActivePartner] = useState<Partner | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  // Compose state
  const [composing, setComposing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchUser[]>([]);
  const [searching, setSearching] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  const userId = session?.user?.id ?? null;

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        setConversations(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // Open a conversation thread
  const openThread = useCallback(async (conversationId: string) => {
    setLoadingThread(true);
    setShowSidebar(false);
    setComposing(false);
    setActiveConversationId(conversationId);

    try {
      const res = await fetch(`/api/messages/${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        setActivePartner(data.partner);
        setMessages(data.messages);
        // Refresh conversation list to update unread counts
        fetchConversations();
      }
    } finally {
      setLoadingThread(false);
    }
  }, [fetchConversations]);

  // Auto-open thread from URL param (?to=userId)
  useEffect(() => {
    if (!initialTo) return;

    async function startConversation() {
      try {
        const res = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipientId: initialTo }),
        });
        if (res.ok) {
          const data = await res.json();
          await fetchConversations();
          openThread(data.conversationId);
        }
      } catch {
        // Ignore errors on initial open
      }
    }
    startConversation();
  }, [initialTo, openThread, fetchConversations]);

  // Poll active thread for new messages
  useEffect(() => {
    if (!activeConversationId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/messages/${activeConversationId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages);
        }
      } catch {
        // Ignore poll errors
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [activeConversationId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus message input when thread opens
  useEffect(() => {
    if (activePartner && !loadingThread) {
      messageInputRef.current?.focus();
    }
  }, [activePartner, loadingThread]);

  // Search users for compose
  useEffect(() => {
    if (searchQuery.length < 1) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          // Filter out self
          setSearchResults(
            (data.users as SearchUser[]).filter((u) => u.id !== userId)
          );
        }
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [searchQuery, userId]);

  // Start a conversation with a user from search
  async function startConversationWith(recipientId: string) {
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientId }),
      });
      if (res.ok) {
        const data = await res.json();
        setSearchQuery("");
        setSearchResults([]);
        setComposing(false);
        await fetchConversations();
        openThread(data.conversationId);
      } else {
        const err = await res.json();
        toast(err.error || "Failed to start conversation", "error");
      }
    } catch {
      toast("Failed to start conversation", "error");
    }
  }

  // Send a message
  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversationId || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/messages/${activeConversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage.trim() }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: msg.id,
            sender_id: msg.sender_id,
            body: msg.body,
            created_at: msg.created_at,
            sender_name: session?.user?.name ?? "",
            sender_image: session?.user?.image ?? null,
          },
        ]);
        setNewMessage("");
        fetchConversations();
      } else {
        const err = await res.json();
        toast(err.error || "Failed to send message", "error");
      }
    } catch {
      toast("Failed to send message", "error");
    } finally {
      setSending(false);
    }
  }

  function handleBackToList() {
    setShowSidebar(true);
    setActiveConversationId(null);
    setActivePartner(null);
    setMessages([]);
    setComposing(false);
  }

  return (
    <>
      <AppHeader breadcrumb={{ label: "Messages", href: "/messages" }} />
      <main id="main-content" className="mx-auto max-w-6xl px-4 pt-24 pb-16">
        <div className="flex h-[calc(100vh-200px)] min-h-[500px] border border-medium-gray/20">
          {/* Sidebar — conversation list */}
          <div
            className={`w-full shrink-0 border-r border-medium-gray/20 md:w-80 ${
              !showSidebar && (activePartner || composing) ? "hidden md:block" : ""
            }`}
          >
            <div className="flex items-center justify-between border-b border-medium-gray/20 p-4">
              <h1 className="text-xs font-semibold uppercase tracking-widest text-code-green">
                {"// messages"}
              </h1>
              <button
                onClick={() => {
                  setComposing(true);
                  setActiveConversationId(null);
                  setActivePartner(null);
                  setMessages([]);
                  setShowSidebar(false);
                }}
                className="border border-code-green px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-code-green transition-colors hover:bg-code-green hover:text-black"
              >
                + New
              </button>
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
                  <p className="mt-2 text-xs text-medium-gray/60">
                    Click{" "}
                    <button
                      onClick={() => {
                        setComposing(true);
                        setShowSidebar(false);
                      }}
                      className="text-code-blue hover:underline"
                    >
                      + New
                    </button>{" "}
                    to start a conversation or visit a{" "}
                    <Link href="/people" className="text-code-blue hover:underline">
                      user&apos;s profile
                    </Link>
                  </p>
                </div>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.conversation_id}
                    onClick={() => openThread(c.conversation_id)}
                    className={`flex w-full items-center gap-3 border-b border-medium-gray/10 p-4 text-left transition-colors hover:bg-medium-gray/5 ${
                      activeConversationId === c.conversation_id
                        ? "bg-medium-gray/10"
                        : ""
                    }`}
                  >
                    {/* Avatar */}
                    {c.partner_image ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={c.partner_image}
                        alt={c.partner_name}
                        className="h-10 w-10 shrink-0 object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-code-blue/10 text-sm font-bold text-code-blue">
                        {c.partner_name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p
                          className={`truncate text-sm font-semibold ${
                            c.unread_count > 0 ? "text-white" : ""
                          }`}
                        >
                          {c.partner_name}
                        </p>
                        {c.last_message_at && (
                          <span className="shrink-0 text-[10px] text-medium-gray">
                            {formatTimeAgo(c.last_message_at)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p
                          className={`truncate text-xs ${
                            c.unread_count > 0 ? "text-white" : "text-medium-gray"
                          }`}
                        >
                          {c.last_message_sender_id === userId ? "You: " : ""}
                          {c.last_message || "No messages yet"}
                        </p>
                        {c.unread_count > 0 && (
                          <span className="flex h-4 min-w-[16px] shrink-0 items-center justify-center bg-code-green px-1 text-[10px] font-bold text-black">
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

          {/* Main panel — thread or compose */}
          <div
            className={`flex flex-1 flex-col ${
              showSidebar && !activePartner && !composing ? "hidden md:flex" : ""
            }`}
          >
            {/* Compose new message */}
            {composing ? (
              <div className="flex flex-1 flex-col">
                <div className="flex items-center gap-3 border-b border-medium-gray/20 p-4">
                  <button
                    onClick={handleBackToList}
                    className="text-medium-gray hover:text-white md:hidden"
                    aria-label="Back to conversations"
                  >
                    &larr;
                  </button>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green">
                    {"// new message"}
                  </h2>
                </div>

                <div className="border-b border-medium-gray/20 p-4">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-medium-gray">
                    To:
                  </label>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for a user..."
                    autoFocus
                    className="w-full border border-medium-gray/30 bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-code-green"
                  />

                  {/* Search results */}
                  {searchQuery.length >= 1 && (
                    <div className="mt-2 max-h-60 overflow-y-auto border border-medium-gray/20">
                      {searching ? (
                        <div className="p-3 text-center text-xs text-medium-gray">
                          Searching...
                        </div>
                      ) : searchResults.length === 0 ? (
                        <div className="p-3 text-center text-xs text-medium-gray">
                          No users found
                        </div>
                      ) : (
                        searchResults.map((u) => (
                          <button
                            key={u.id}
                            onClick={() => startConversationWith(u.id)}
                            className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-code-blue/10"
                          >
                            {u.image ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={u.image}
                                alt={u.name}
                                className="h-8 w-8 shrink-0 object-cover"
                              />
                            ) : (
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-code-blue/10 text-xs font-bold text-code-blue">
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="text-sm">{u.name}</span>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-1 items-center justify-center">
                  <p className="text-sm text-medium-gray">
                    Search for a user above to start a conversation
                  </p>
                </div>
              </div>
            ) : activeConversationId && activePartner ? (
              /* Active conversation thread */
              <>
                {/* Thread header */}
                <div className="flex items-center gap-3 border-b border-medium-gray/20 p-4">
                  <button
                    onClick={handleBackToList}
                    className="text-medium-gray hover:text-white md:hidden"
                    aria-label="Back to conversations"
                  >
                    &larr;
                  </button>
                  {activePartner.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={activePartner.image}
                      alt={activePartner.name}
                      className="h-8 w-8 shrink-0 object-cover"
                    />
                  ) : (
                    <Link
                      href={`/users/${activePartner.id}`}
                      className="flex h-8 w-8 items-center justify-center bg-code-blue/10 text-xs font-bold text-code-blue hover:bg-code-blue/20"
                    >
                      {activePartner.name.charAt(0).toUpperCase()}
                    </Link>
                  )}
                  <Link
                    href={`/users/${activePartner.id}`}
                    className="text-sm font-semibold hover:text-code-blue"
                  >
                    {activePartner.name}
                  </Link>
                </div>

                {/* Messages */}
                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {loadingThread ? (
                    <div className="space-y-3">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className={`flex ${i % 2 === 0 ? "" : "justify-end"}`}
                        >
                          <div className="animate-pulse">
                            <div
                              className={`h-8 ${
                                i % 2 === 0 ? "w-48" : "w-36"
                              } bg-medium-gray/10`}
                            />
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
                      const showTime =
                        !prevMsg ||
                        new Date(msg.created_at).getTime() -
                          new Date(prevMsg.created_at).getTime() >
                          5 * 60 * 1000;
                      const sameSender =
                        prevMsg?.sender_id === msg.sender_id && !showTime;

                      return (
                        <div key={msg.id}>
                          {showTime && (
                            <p className="my-4 text-center text-[10px] text-medium-gray/50">
                              {new Date(msg.created_at).toLocaleString()}
                            </p>
                          )}
                          <div
                            className={`flex ${isMine ? "justify-end" : ""} ${
                              sameSender ? "" : "mt-2"
                            }`}
                          >
                            {!isMine && !sameSender && (
                              <div className="mr-2 mt-1">
                                {msg.sender_image ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img
                                    src={msg.sender_image}
                                    alt={msg.sender_name}
                                    className="h-6 w-6 shrink-0 object-cover"
                                  />
                                ) : (
                                  <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-code-blue/10 text-[10px] font-bold text-code-blue">
                                    {msg.sender_name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                            )}
                            {!isMine && sameSender && (
                              <div className="mr-2 w-6" />
                            )}
                            <div
                              className={`max-w-[75%] px-3 py-2 text-sm ${
                                isMine
                                  ? "bg-code-green/15 text-white"
                                  : "bg-code-blue/10 text-white"
                              }`}
                            >
                              {!isMine && !sameSender && (
                                <p className="mb-0.5 text-[10px] font-semibold text-code-blue">
                                  {msg.sender_name}
                                </p>
                              )}
                              {msg.body}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={bottomRef} />
                </div>

                {/* Message input */}
                <form
                  onSubmit={handleSend}
                  className="border-t border-medium-gray/20 p-4"
                >
                  <div className="flex gap-2">
                    <input
                      ref={messageInputRef}
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
                      {sending ? "..." : "Send"}
                    </button>
                  </div>
                  <p className="mt-1 text-right text-[10px] text-medium-gray/40">
                    {newMessage.length}/2000
                  </p>
                </form>
              </>
            ) : (
              /* Empty state */
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-medium-gray">
                    Select a conversation
                  </p>
                  <p className="mt-1 text-xs text-medium-gray/50">
                    or{" "}
                    <button
                      onClick={() => {
                        setComposing(true);
                        setShowSidebar(false);
                      }}
                      className="text-code-blue hover:underline"
                    >
                      start a new one
                    </button>
                  </p>
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
