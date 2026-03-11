"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type TrendingEndeavor = {
  id: string;
  title: string;
  category: string;
  status: string;
  image_url: string | null;
  total_members: number;
  new_members_this_week: number;
};

export function TrendingWeekly() {
  const [items, setItems] = useState<TrendingEndeavor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/trending/weekly")
      .then((r) => (r.ok ? r.json() : []))
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse flex items-center gap-3 p-3">
            <div className="h-8 w-10 bg-medium-gray/10 shrink-0" />
            <div className="flex-1">
              <div className="h-3 w-32 bg-medium-gray/10 mb-1" />
              <div className="h-2 w-20 bg-medium-gray/10" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
        {"// trending this week"}
      </h3>
      <div className="space-y-1">
        {items.map((e, i) => (
          <Link
            key={e.id}
            href={`/endeavors/${e.id}`}
            className="group flex items-center gap-3 border border-medium-gray/10 p-3 transition-colors hover:border-code-green/30"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center text-xs font-bold text-medium-gray">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm truncate group-hover:text-code-green transition-colors">
                {e.title}
              </p>
              <p className="text-[10px] text-medium-gray">
                {e.category} &middot; {e.total_members} members
                {e.new_members_this_week > 0 && (
                  <span className="text-code-green"> +{e.new_members_this_week} this week</span>
                )}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
