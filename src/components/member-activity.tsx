"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/time";

type ActivityEntry = {
  id: string;
  type: string;
  title: string;
  detail: string | null;
  actorName: string;
  actorId: string;
  createdAt: string;
};

const typeConfig: Record<string, { icon: string; color: string }> = {
  member_joined: { icon: "+", color: "text-code-green" },
  member_left: { icon: "-", color: "text-red-400" },
  task_created: { icon: ">", color: "text-code-blue" },
  task_completed: { icon: "*", color: "text-code-green" },
  discussion: { icon: "#", color: "text-yellow-400" },
  milestone_completed: { icon: "*", color: "text-code-green" },
  milestone_created: { icon: "o", color: "text-code-blue" },
  story_published: { icon: "~", color: "text-purple-400" },
  update_posted: { icon: "!", color: "text-orange-400" },
};

export function MemberActivity({ endeavorId }: { endeavorId: string }) {
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/activity`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setActivity(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [endeavorId]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-12 animate-pulse bg-medium-gray/10 border border-medium-gray/10"
          />
        ))}
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <p className="text-xs text-medium-gray text-center py-4">
        No recent activity.
      </p>
    );
  }

  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
        {"// recent activity"}
      </h3>
      <div className="space-y-1">
        {activity.slice(0, 15).map((entry) => {
          const config = typeConfig[entry.type] || {
            icon: ">",
            color: "text-medium-gray",
          };
          return (
            <div
              key={entry.id}
              className="flex items-start gap-2 border-b border-medium-gray/10 py-2 last:border-b-0"
            >
              <span
                className={`mt-0.5 font-mono text-xs font-bold ${config.color}`}
              >
                {config.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-light-gray">
                  <Link
                    href={`/users/${entry.actorId}`}
                    className="text-code-blue hover:text-code-green"
                  >
                    {entry.actorName}
                  </Link>{" "}
                  {entry.title}
                </p>
                {entry.detail && (
                  <p className="text-[10px] text-medium-gray truncate">
                    {entry.detail}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-[10px] text-medium-gray">
                {formatTimeAgo(entry.createdAt)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
