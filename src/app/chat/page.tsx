"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";
import { useSession } from "@/lib/auth-client";
import { formatTimeAgo } from "@/lib/time";

type ChatRoom = {
  id: string;
  name: string;
  description: string | null;
  endeavor_id: string | null;
  type: "public" | "private";
  creator_id: string;
  member_count: number;
  last_message_at: string | null;
  created_at: string;
  creator_name: string;
};

type ChatMessage = {
  id: string;
  room_id: string;
  sender_id: string;
  body: string;
  type: string;
  created_at: string;
  sender_name: string;
  sender_image: string | null;
};

export default function ChatPage() {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  // Create room state
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  const userId = session?.user?.id ?? null;
  const activeRoom = rooms.find((r) => r.id === activeRoomId) ?? null;

  // Fetch rooms
  const fetchRooms = useCallback(async () => {
    try {
      const res = await fetch("/api/chat-rooms");
      if (res.ok) {
        setRooms(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Fetch messages for the active room
  const fetchMessages = useCallback(async (roomId: string) => {
    try {
      const res = await fetch(`/api/chat-rooms/${roomId}/messages?limit=100`);
      if (res.ok) {
        const data = await res.json();
        setMessages(Array.isArray(data) ? data : data.messages ?? []);
      }
    } catch {
      // Ignore fetch errors during polling
    }
  }, []);

  // Open a room
  const openRoom = useCallback(
    async (roomId: string) => {
      setLoadingMessages(true);
      setShowSidebar(false);
      setShowCreateForm(false);
      setActiveRoomId(roomId);

      try {
        await fetchMessages(roomId);
      } finally {
        setLoadingMessages(false);
      }
    },
    [fetchMessages]
  );

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (!activeRoomId) return;
    const interval = setInterval(() => {
      fetchMessages(activeRoomId);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeRoomId, fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus message input when room opens
  useEffect(() => {
    if (activeRoom && !loadingMessages) {
      messageInputRef.current?.focus();
    }
  }, [activeRoom, loadingMessages]);

  // Create a room
  async function handleCreateRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!roomName.trim() || creating) return;

    setCreating(true);
    try {
      const res = await fetch("/api/chat-rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: roomName.trim(),
          description: roomDescription.trim() || null,
          type: "public",
        }),
      });
      if (res.ok) {
        const room = await res.json();
        toast("Room created", "success");
        setRoomName("");
        setRoomDescription("");
        setShowCreateForm(false);
        await fetchRooms();
        openRoom(room.id);
      } else {
        const err = await res.json();
        toast(err.error || "Failed to create room", "error");
      }
    } catch {
      toast("Failed to create room", "error");
    } finally {
      setCreating(false);
    }
  }

  // Send a message
  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !activeRoomId || sending) return;

    setSending(true);
    try {
      const res = await fetch(`/api/chat-rooms/${activeRoomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: newMessage.trim() }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            id: msg.id,
            room_id: activeRoomId,
            sender_id: msg.sender_id ?? userId ?? "",
            body: msg.body,
            type: msg.type ?? "text",
            created_at: msg.created_at,
            sender_name: msg.sender_name ?? session?.user?.name ?? "",
            sender_image: msg.sender_image ?? session?.user?.image ?? null,
          },
        ]);
        setNewMessage("");
        fetchRooms();
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
    setActiveRoomId(null);
    setMessages([]);
    setShowCreateForm(false);
  }

  return (
    <>
      <AppHeader breadcrumb={{ label: "Chat", href: "/chat" }} />
      <main id="main-content" className="mx-auto max-w-6xl px-4 pt-24 pb-16">
        <div className="flex h-[calc(100vh-200px)] min-h-[500px] border border-medium-gray/20">
          {/* Sidebar — room list */}
          <div
            className={`w-full shrink-0 border-r border-medium-gray/20 md:w-80 ${
              !showSidebar && (activeRoom || showCreateForm) ? "hidden md:block" : ""
            }`}
          >
            <div className="flex items-center justify-between border-b border-medium-gray/20 p-4">
              <h1 className="text-xs font-semibold uppercase tracking-widest text-code-green">
                {"// chat rooms"}
              </h1>
              <button
                onClick={() => {
                  setShowCreateForm(true);
                  setActiveRoomId(null);
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
                      <div className="mb-1 h-3 w-32 bg-medium-gray/10" />
                      <div className="h-2.5 w-48 bg-medium-gray/10" />
                    </div>
                  ))}
                </div>
              ) : rooms.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-medium-gray">No chat rooms yet</p>
                  <p className="mt-2 text-xs text-medium-gray/60">
                    Click{" "}
                    <button
                      onClick={() => {
                        setShowCreateForm(true);
                        setShowSidebar(false);
                      }}
                      className="text-code-blue hover:underline"
                    >
                      + New
                    </button>{" "}
                    to create the first room
                  </p>
                </div>
              ) : (
                rooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => openRoom(room.id)}
                    className={`flex w-full flex-col border-b border-medium-gray/10 p-4 text-left transition-colors hover:bg-medium-gray/5 ${
                      activeRoomId === room.id ? "bg-medium-gray/10" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          {room.name}
                        </span>
                        {room.type === "private" && (
                          <span className="text-[10px] text-medium-gray/60">
                            private
                          </span>
                        )}
                      </div>
                      {room.last_message_at && (
                        <span className="shrink-0 text-[10px] text-medium-gray">
                          {formatTimeAgo(room.last_message_at)}
                        </span>
                      )}
                    </div>
                    {room.description && (
                      <p className="mt-0.5 truncate text-xs text-medium-gray">
                        {room.description}
                      </p>
                    )}
                    <div className="mt-1 flex items-center gap-3 text-[10px] text-medium-gray/60">
                      <span>{room.member_count} member{room.member_count !== 1 ? "s" : ""}</span>
                      <span>by {room.creator_name}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Main panel — messages or create form */}
          <div
            className={`flex flex-1 flex-col ${
              showSidebar && !activeRoom && !showCreateForm ? "hidden md:flex" : ""
            }`}
          >
            {/* Create room form */}
            {showCreateForm ? (
              <div className="flex flex-1 flex-col">
                <div className="flex items-center gap-3 border-b border-medium-gray/20 p-4">
                  <button
                    onClick={handleBackToList}
                    className="text-medium-gray hover:text-white md:hidden"
                    aria-label="Back to rooms"
                  >
                    &larr;
                  </button>
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green">
                    {"// create room"}
                  </h2>
                </div>

                <form onSubmit={handleCreateRoom} className="p-6">
                  <div className="mb-4">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-medium-gray">
                      Room name
                    </label>
                    <input
                      type="text"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      placeholder="e.g. General Discussion"
                      autoFocus
                      maxLength={100}
                      className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray outline-none focus:border-code-green"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-medium-gray">
                      Description (optional)
                    </label>
                    <input
                      type="text"
                      value={roomDescription}
                      onChange={(e) => setRoomDescription(e.target.value)}
                      placeholder="What is this room about?"
                      maxLength={300}
                      className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray outline-none focus:border-code-green"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={!roomName.trim() || creating}
                      className="border border-code-green bg-code-green px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-transparent hover:text-code-green disabled:opacity-30"
                    >
                      {creating ? "Creating..." : "Create Room"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setShowSidebar(true);
                      }}
                      className="border border-medium-gray/30 px-4 py-2 text-sm text-medium-gray transition-colors hover:border-medium-gray hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </form>

                <div className="flex flex-1 items-center justify-center">
                  <p className="text-sm text-medium-gray">
                    Fill out the form above to create a new chat room
                  </p>
                </div>
              </div>
            ) : activeRoomId && activeRoom ? (
              /* Active room */
              <>
                {/* Room header */}
                <div className="flex items-center gap-3 border-b border-medium-gray/20 p-4">
                  <button
                    onClick={handleBackToList}
                    className="text-medium-gray hover:text-white md:hidden"
                    aria-label="Back to rooms"
                  >
                    &larr;
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="truncate text-sm font-semibold text-white">
                        {activeRoom.name}
                      </h2>
                      {activeRoom.type === "private" && (
                        <span className="shrink-0 text-[10px] text-medium-gray/60">
                          private
                        </span>
                      )}
                    </div>
                    {activeRoom.description && (
                      <p className="truncate text-xs text-medium-gray">
                        {activeRoom.description}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-[10px] text-medium-gray">
                    {activeRoom.member_count} member{activeRoom.member_count !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Messages */}
                <div className="flex-1 space-y-3 overflow-y-auto p-4">
                  {loadingMessages ? (
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
                        No messages yet. Start the conversation!
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
                      className="flex-1 border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray outline-none focus:border-code-green"
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
                    Select a chat room
                  </p>
                  <p className="mt-1 text-xs text-medium-gray/50">
                    or{" "}
                    <button
                      onClick={() => {
                        setShowCreateForm(true);
                        setShowSidebar(false);
                      }}
                      className="text-code-blue hover:underline"
                    >
                      create a new one
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
