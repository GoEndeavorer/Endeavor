"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/time";

type NotificationGroup = {
  type: string;
  count: number;
  latest: {
    id: string;
    message: string;
    link: string | null;
    created_at: string;
  };
};

export function NotificationDigest() {
  const [groups, setGroups] = useState<NotificationGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications?limit=50")
      .then((r) => (r.ok ? r.json() : []))
      .then((notifications: { id: string; type: string; message: string; link: string | null; created_at: string; read: boolean }[]) => {
        const unread = notifications.filter((n) => !n.read);
        const grouped = new Map<string, NotificationGroup>();

        for (const n of unread) {
          const existing = grouped.get(n.type);
          if (existing) {
            existing.count++;
          } else {
            grouped.set(n.type, {
              type: n.type,
              count: 1,
              latest: {
                id: n.id,
                message: n.message,
                link: n.link,
                created_at: n.created_at,
              },
            });
          }
        }

        setGroups(Array.from(grouped.values()).sort((a, b) => b.count - a.count));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || groups.length === 0) return null;

  const typeLabels: Record<string, string> = {
    join_request: "Join requests",
    new_member: "New members",
    discussion: "Discussions",
    milestone: "Milestones",
    endorsement: "Endorsements",
    task: "Tasks",
    message: "Messages",
  };

  const typeColors: Record<string, string> = {
    join_request: "text-yellow-400",
    new_member: "text-code-green",
    discussion: "text-code-blue",
    milestone: "text-purple-400",
    endorsement: "text-yellow-400",
    task: "text-orange-400",
    message: "text-code-blue",
  };

  return (
    <div className="border border-medium-gray/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// unread notifications"}
        </h4>
        <Link
          href="/notifications"
          className="text-xs text-code-blue hover:text-code-green transition-colors"
        >
          View all
        </Link>
      </div>
      <div className="space-y-2">
        {groups.map((g) => (
          <div key={g.type} className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`text-xs font-bold ${typeColors[g.type] || "text-medium-gray"}`}>
                {g.count}
              </span>
              <span className="text-xs text-light-gray truncate">
                {typeLabels[g.type] || g.type}
              </span>
            </div>
            <span className="text-xs text-medium-gray shrink-0">
              {formatTimeAgo(g.latest.created_at)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 pt-2 border-t border-medium-gray/10">
        <p className="text-xs text-medium-gray">
          {groups.reduce((sum, g) => sum + g.count, 0)} total unread
        </p>
      </div>
    </div>
  );
}
