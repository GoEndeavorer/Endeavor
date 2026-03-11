"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Recommendation = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  memberCount: number;
  creatorName: string;
  reason: string;
};

export function Recommendations() {
  const [recs, setRecs] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/recommendations")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setRecs(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse bg-medium-gray/10 border border-medium-gray/10"
          />
        ))}
      </div>
    );
  }

  if (recs.length === 0) return null;

  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
        {"// recommended for you"}
      </h3>
      <div className="space-y-2">
        {recs.slice(0, 6).map((rec) => (
          <Link
            key={rec.id}
            href={`/endeavors/${rec.id}`}
            className="group block border border-medium-gray/20 p-4 transition-colors hover:border-code-green/30"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold group-hover:text-code-green transition-colors">
                  {rec.title}
                </p>
                <p className="mt-0.5 text-xs text-medium-gray truncate">
                  {rec.category} &middot; {rec.memberCount} member
                  {rec.memberCount !== 1 ? "s" : ""} &middot; by{" "}
                  {rec.creatorName}
                </p>
              </div>
              <span className="shrink-0 border border-code-blue/20 bg-code-blue/5 px-2 py-0.5 text-[10px] text-code-blue">
                {rec.reason}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
