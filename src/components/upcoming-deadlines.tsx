"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Deadline = {
  id: string;
  title: string;
  type: "task" | "milestone";
  dueDate: string;
  endeavorId: string;
  endeavorTitle: string;
};

export function UpcomingDeadlines() {
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/deadlines")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setDeadlines(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || deadlines.length === 0) return null;

  return (
    <div className="border border-medium-gray/20 p-4">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
        {"// upcoming deadlines"}
      </h4>
      <div className="space-y-2">
        {deadlines.map((d) => {
          const date = new Date(d.dueDate);
          const now = new Date();
          const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          const isOverdue = diffDays < 0;
          const isSoon = diffDays >= 0 && diffDays <= 3;

          return (
            <Link
              key={`${d.type}-${d.id}`}
              href={`/endeavors/${d.endeavorId}`}
              className="flex items-center gap-3 border border-medium-gray/10 p-2 hover:border-medium-gray/30 transition-colors"
            >
              <span className={`font-mono text-xs font-bold ${d.type === "task" ? "text-code-blue" : "text-code-green"}`}>
                {d.type === "task" ? ">" : "*"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm truncate">{d.title}</p>
                <p className="text-xs text-medium-gray truncate">{d.endeavorTitle}</p>
              </div>
              <span className={`shrink-0 text-xs font-mono ${
                isOverdue ? "text-red-400 font-semibold" : isSoon ? "text-yellow-400" : "text-medium-gray"
              }`}>
                {isOverdue
                  ? `${Math.abs(diffDays)}d overdue`
                  : diffDays === 0
                  ? "Today"
                  : diffDays === 1
                  ? "Tomorrow"
                  : `${diffDays}d`}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
