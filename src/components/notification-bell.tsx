"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/time";

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

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setNotifications(data);
      })
      .catch(() => {});
  }, []);

  // Initial fetch + poll every 30s
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const unread = notifications.filter((n) => !n.read).length;

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAllRead: true }),
    });
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative text-sm text-code-blue hover:text-code-green"
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        Alerts
        {unread > 0 && (
          <span aria-hidden="true" className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center bg-code-green text-[10px] font-bold text-black">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div role="menu" aria-label="Notifications" className="absolute right-0 top-8 z-50 w-80 border border-medium-gray/30 bg-black shadow-lg">
          <div className="flex items-center justify-between border-b border-medium-gray/30 px-4 py-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-code-green">
              Notifications
            </span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-code-blue hover:text-code-green"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-xs text-medium-gray">
                No notifications
              </div>
            ) : (
              notifications.slice(0, 20).map((n) => {
                const icon = typeIcons[n.type] || ">";
                const color = typeColors[n.type] || "text-medium-gray";
                return (
                  <div
                    key={n.id}
                    className={`border-b border-medium-gray/10 px-4 py-3 ${
                      !n.read ? "bg-white/5" : ""
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className={`mt-0.5 font-mono text-xs font-bold ${color}`}>
                        {icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        {n.endeavorId ? (
                          <Link
                            href={`/endeavors/${n.endeavorId}`}
                            className="block text-sm text-light-gray hover:text-white"
                            onClick={() => setOpen(false)}
                          >
                            {n.message}
                          </Link>
                        ) : (
                          <p className="text-sm text-light-gray">{n.message}</p>
                        )}
                        <p className="mt-1 text-xs text-medium-gray">
                          {formatTimeAgo(n.createdAt)}
                        </p>
                      </div>
                      {!n.read && (
                        <span className="mt-1 h-2 w-2 shrink-0 bg-code-green" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {notifications.length > 0 && (
            <div className="border-t border-medium-gray/20 px-4 py-2">
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="block text-center text-xs text-medium-gray hover:text-code-green transition-colors"
              >
                View all notifications &rarr;
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
