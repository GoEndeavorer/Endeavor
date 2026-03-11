"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { formatTimeAgo } from "@/lib/time";

export const dynamic = "force-dynamic";

type Notification = {
  id: string;
  type: string;
  message: string;
  endeavorId: string | null;
  read: boolean;
  createdAt: string;
};

const typeIcons: Record<string, string> = {
  join_request: "+",
  member_joined: "+",
  new_discussion: "#",
  task_assigned: ">",
  funding_received: "$",
  milestone_completed: "*",
  status_change: "~",
  update_posted: "!",
  member_left: "-",
  direct_message: "@",
};

const typeColors: Record<string, string> = {
  join_request: "text-code-green",
  member_joined: "text-code-green",
  new_discussion: "text-code-blue",
  task_assigned: "text-yellow-400",
  funding_received: "text-purple-400",
  milestone_completed: "text-code-green",
  status_change: "text-code-blue",
  update_posted: "text-yellow-400",
  member_left: "text-red-400",
  direct_message: "text-purple-400",
};

export default function NotificationsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/notifications")
        .then((r) => (r.ok ? r.json() : []))
        .then(setNotifications)
        .finally(() => setLoading(false));
    }
  }, [session]);

  async function markAllRead() {
    await fetch("/api/notifications/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read_all" }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function markRead(id: string) {
    await fetch("/api/notifications/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read", ids: [id] }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  async function batchMarkRead() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    await fetch("/api/notifications/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "read", ids }),
    });
    setNotifications((prev) =>
      prev.map((n) => (selected.has(n.id) ? { ...n, read: true } : n))
    );
    setSelected(new Set());
    setSelectMode(false);
  }

  async function batchDelete() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;
    await fetch("/api/notifications/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", ids }),
    });
    setNotifications((prev) => prev.filter((n) => !selected.has(n.id)));
    setSelected(new Set());
    setSelectMode(false);
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAll() {
    setSelected(new Set(displayed.map((n) => n.id)));
  }

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center text-medium-gray">
        Loading...
      </div>
    );
  }

  const displayed =
    filter === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Notifications", href: "/notifications" }} />

      <main className="mx-auto max-w-2xl px-4 pt-24 pb-16">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <span className="bg-code-green/10 border border-code-green/30 px-2 py-0.5 text-xs text-code-green">
                {unreadCount} unread
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 text-xs transition-colors ${
                  filter === "all"
                    ? "bg-code-green/10 text-code-green border border-code-green/30"
                    : "text-medium-gray hover:text-white"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-3 py-1 text-xs transition-colors ${
                  filter === "unread"
                    ? "bg-code-green/10 text-code-green border border-code-green/30"
                    : "text-medium-gray hover:text-white"
                }`}
              >
                Unread
              </button>
            </div>
            <button
              onClick={() => { setSelectMode(!selectMode); setSelected(new Set()); }}
              className={`text-xs transition-colors ${
                selectMode ? "text-code-green" : "text-medium-gray hover:text-white"
              }`}
            >
              {selectMode ? "Cancel" : "Select"}
            </button>
            {unreadCount > 0 && !selectMode && (
              <button
                onClick={markAllRead}
                className="text-xs text-code-blue hover:text-code-green transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Batch action bar */}
        {selectMode && (
          <div className="mb-4 flex items-center gap-3 border border-medium-gray/30 p-3">
            <span className="text-xs text-medium-gray">
              {selected.size} selected
            </span>
            <button
              onClick={selectAll}
              className="text-xs text-code-blue hover:text-code-green transition-colors"
            >
              Select all
            </button>
            <div className="flex-1" />
            <button
              onClick={batchMarkRead}
              disabled={selected.size === 0}
              className="text-xs text-code-blue hover:text-code-green transition-colors disabled:opacity-30"
            >
              Mark read
            </button>
            <button
              onClick={batchDelete}
              disabled={selected.size === 0}
              className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-30"
            >
              Delete
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border border-medium-gray/10 p-3 animate-pulse">
                <div className="h-4 w-3/4 bg-medium-gray/20 mb-2" />
                <div className="h-3 w-1/4 bg-medium-gray/10" />
              </div>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="border border-medium-gray/20 p-12 text-center">
            <p className="text-medium-gray text-sm">
              {filter === "unread"
                ? "No unread notifications."
                : "No notifications yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {displayed.map((n) => {
              const icon = typeIcons[n.type] || ">";
              const color = typeColors[n.type] || "text-medium-gray";
              const time = new Date(n.createdAt);
              const ago = formatTimeAgo(time);

              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 border p-3 transition-colors cursor-pointer ${
                    n.read
                      ? "border-medium-gray/10 opacity-60"
                      : "border-medium-gray/30 hover:border-code-green/30"
                  } ${selected.has(n.id) ? "bg-code-green/5 border-code-green/30" : ""}`}
                  onClick={() => {
                    if (selectMode) {
                      toggleSelect(n.id);
                    } else if (!n.read) {
                      markRead(n.id);
                    }
                  }}
                >
                  {selectMode && (
                    <div className="mt-0.5 shrink-0">
                      <div
                        className={`h-4 w-4 border flex items-center justify-center text-xs ${
                          selected.has(n.id)
                            ? "border-code-green bg-code-green text-black"
                            : "border-medium-gray/50"
                        }`}
                      >
                        {selected.has(n.id) && "✓"}
                      </div>
                    </div>
                  )}
                  <span className={`mt-0.5 text-sm font-mono font-bold ${color}`}>
                    {icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-light-gray">{n.message}</p>
                    <div className="mt-1 flex items-center gap-3">
                      <span className="text-xs text-medium-gray">{ago}</span>
                      {n.endeavorId && (
                        <Link
                          href={`/endeavors/${n.endeavorId}`}
                          className="text-xs text-code-blue hover:text-code-green"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View endeavor &rarr;
                        </Link>
                      )}
                    </div>
                  </div>
                  {!selectMode && (
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {!n.read && (
                        <span className="h-2 w-2 bg-code-green" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          fetch("/api/notifications/batch", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ action: "delete", ids: [n.id] }),
                          });
                          setNotifications((prev) => prev.filter((x) => x.id !== n.id));
                        }}
                        className="text-xs text-medium-gray/50 hover:text-red-400"
                      >
                        x
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
