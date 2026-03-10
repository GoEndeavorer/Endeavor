"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

type Notification = {
  id: string;
  type: string;
  message: string;
  endeavorId: string | null;
  read: boolean;
  createdAt: string;
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setNotifications(data);
      })
      .catch(() => {});
  }, []);

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
      >
        Alerts
        {unread > 0 && (
          <span className="absolute -top-1 -right-2 flex h-4 w-4 items-center justify-center bg-code-green text-[10px] font-bold text-black">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-50 w-80 border border-medium-gray/30 bg-black shadow-lg">
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
              notifications.slice(0, 20).map((n) => (
                <div
                  key={n.id}
                  className={`border-b border-medium-gray/10 px-4 py-3 ${
                    !n.read ? "bg-white/5" : ""
                  }`}
                >
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
                    {new Date(n.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
