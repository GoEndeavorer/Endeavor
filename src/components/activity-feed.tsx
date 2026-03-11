"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/time";

type ActivityItem = {
  type: string;
  description: string;
  userId: string;
  userName: string;
  timestamp: string;
};

const dotColors: Record<string, string> = {
  member_joined: "bg-code-blue",
  discussion: "bg-code-green",
  task_completed: "bg-purple-400",
  milestone_completed: "bg-yellow-400",
  payment: "bg-code-green",
  story_published: "bg-code-blue",
};

export function ActivityFeed({ endeavorId }: { endeavorId: string }) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/activity`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setItems(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [endeavorId]);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-medium-gray/20" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-medium-gray/10" />
              <div className="h-3 w-20 bg-medium-gray/10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="border border-medium-gray/20 p-8 text-center">
        <p className="text-sm text-medium-gray">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {items.map((item, i) => {
        const color = dotColors[item.type] || "bg-medium-gray";
        return (
          <div
            key={i}
            className="relative flex items-start gap-3 border-b border-medium-gray/20 py-3 last:border-b-0"
          >
            {/* timeline connector */}
            {i < items.length - 1 && (
              <span className="absolute left-[3px] top-6 h-full w-px bg-medium-gray/20" />
            )}
            <span
              className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${color}`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-light-gray">
                <Link
                  href={`/users/${item.userId}`}
                  className="font-semibold text-code-green hover:underline"
                >
                  {item.userName}
                </Link>{" "}
                {item.description}
              </p>
              <p className="mt-1 text-xs text-medium-gray">
                {formatTimeAgo(item.timestamp)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
