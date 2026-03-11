"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
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
};

export default function NotificationsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

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
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function markRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
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
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-code-blue hover:text-code-green transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <p className="text-medium-gray text-sm">Loading...</p>
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
                  className={`flex items-start gap-3 border p-3 transition-colors ${
                    n.read
                      ? "border-medium-gray/10 opacity-60"
                      : "border-medium-gray/30 hover:border-code-green/30"
                  }`}
                  onClick={() => !n.read && markRead(n.id)}
                >
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
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {!n.read && (
                      <span className="h-2 w-2 bg-code-green" />
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fetch(`/api/notifications/${n.id}`, { method: "DELETE" });
                        setNotifications((prev) => prev.filter((x) => x.id !== n.id));
                      }}
                      className="text-xs text-medium-gray/50 hover:text-red-400"
                    >
                      x
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
