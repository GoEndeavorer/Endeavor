"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/time";
import { useSession } from "@/lib/auth-client";

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
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fetch unread count
  const fetchUnreadCount = useCallback(() => {
    fetch("/api/notifications/count")
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.count === "number") {
          setUnreadCount(data.count);
        }
      })
      .catch(() => {});
  }, []);

  // Poll unread count every 30 seconds
  useEffect(() => {
    if (!session) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount, session]);

  // Fetch notifications when dropdown opens
  const fetchNotifications = useCallback(() => {
    setLoading(true);
    fetch("/api/notifications?limit=10")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setNotifications(data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Mark all as read
  async function markAllRead() {
    await fetch("/api/notifications/mark-all-read", { method: "POST" });
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }

  if (!session) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative text-sm text-medium-gray hover:text-code-green transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {/* Bell icon */}
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span
            aria-hidden="true"
            className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center bg-code-green px-0.5 text-xs font-bold text-black"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Notifications"
          className="absolute right-0 top-10 z-50 w-80 border border-medium-gray/20 bg-black shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-medium-gray/20 px-4 py-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-code-green">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-code-blue hover:text-code-green transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-xs text-medium-gray">
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-xs text-medium-gray">
                No notifications
              </div>
            ) : (
              notifications.map((n) => {
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
                      <span
                        className={`mt-0.5 font-mono text-xs font-bold ${color}`}
                      >
                        {icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        {n.endeavorId ? (
                          <Link
                            href={`/endeavors/${n.endeavorId}`}
                            className={`block text-sm hover:text-white ${
                              !n.read ? "text-code-green" : "text-medium-gray"
                            }`}
                            onClick={() => setOpen(false)}
                          >
                            {n.message}
                          </Link>
                        ) : (
                          <p
                            className={`text-sm ${
                              !n.read ? "text-code-green" : "text-medium-gray"
                            }`}
                          >
                            {n.message}
                          </p>
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

          <div className="border-t border-medium-gray/20 px-4 py-2">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-xs text-medium-gray hover:text-code-green transition-colors"
            >
              View all &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
