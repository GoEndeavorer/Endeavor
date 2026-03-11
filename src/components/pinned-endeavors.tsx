"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type PinnedItem = {
  id: string;
  endeavorId: string;
  title: string;
  category: string;
  status: string;
  imageUrl: string | null;
};

const statusColors: Record<string, string> = {
  open: "text-code-green",
  "in-progress": "text-code-blue",
  completed: "text-purple-400",
  draft: "text-medium-gray",
};

export function PinnedEndeavors({ userId }: { userId: string }) {
  const [pinned, setPinned] = useState<PinnedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/profile/pinned?userId=${userId}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { if (Array.isArray(data)) setPinned(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="mb-8">
        <div className="flex gap-3 overflow-x-auto">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 w-48 shrink-0 animate-pulse bg-medium-gray/10" />
          ))}
        </div>
      </div>
    );
  }

  if (pinned.length === 0) return null;

  return (
    <div className="mb-8">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
        {"// pinned"}
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pinned.map((p) => (
          <Link
            key={p.id}
            href={`/endeavors/${p.endeavorId}`}
            className="group flex items-center gap-3 border border-medium-gray/20 p-3 transition-colors hover:border-code-green/30"
          >
            {p.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.imageUrl} alt="" className="h-12 w-16 object-cover shrink-0" />
            ) : (
              <div className="flex h-12 w-16 items-center justify-center bg-code-green/5 shrink-0 text-lg font-bold text-code-green/20">
                {p.title.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate group-hover:text-code-green transition-colors">
                {p.title}
              </p>
              <p className="text-xs text-medium-gray">
                <span className={statusColors[p.status] || "text-medium-gray"}>{p.status}</span>
                {" · "}
                {p.category}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
