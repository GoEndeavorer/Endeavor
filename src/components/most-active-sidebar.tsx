"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type ActiveEndeavor = {
  id: string;
  title: string;
  category: string;
  image_url: string | null;
  status: string;
  activity_score: number;
  member_count: number;
};

export function MostActiveSidebar() {
  const [endeavors, setEndeavors] = useState<ActiveEndeavor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/endeavors/most-active")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEndeavors(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 w-3/4 bg-medium-gray/10 mb-1" />
            <div className="h-3 w-1/2 bg-medium-gray/5" />
          </div>
        ))}
      </div>
    );
  }

  if (endeavors.length === 0) return null;

  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
        {"// most active this week"}
      </h3>
      <div className="space-y-2">
        {endeavors.slice(0, 5).map((e, i) => (
          <Link
            key={e.id}
            href={`/endeavors/${e.id}`}
            className="flex items-center gap-3 py-1.5 group"
          >
            <span className="text-xs font-mono text-medium-gray/50 w-4 text-right shrink-0">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm truncate group-hover:text-code-green transition-colors">
                {e.title}
              </p>
              <p className="text-xs text-medium-gray">
                {e.activity_score} actions &middot; {e.member_count} members
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
