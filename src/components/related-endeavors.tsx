"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type RelatedEndeavor = {
  id: string;
  title: string;
  category: string;
  status: string;
  imageUrl: string | null;
  memberCount: number;
};

export function RelatedEndeavors({ endeavorId }: { endeavorId: string }) {
  const [items, setItems] = useState<RelatedEndeavor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/related`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [endeavorId]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 animate-pulse bg-medium-gray/10" />
        ))}
      </div>
    );
  }

  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
        {"// related endeavors"}
      </h3>
      <div className="space-y-1">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/endeavors/${item.id}`}
            className="flex items-center gap-3 border border-medium-gray/20 p-3 transition-colors hover:border-code-green/30"
          >
            {item.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={item.imageUrl}
                alt=""
                className="h-8 w-10 shrink-0 object-cover"
              />
            ) : (
              <div className="flex h-8 w-10 shrink-0 items-center justify-center bg-code-green/10 text-xs font-bold text-code-green">
                {item.title.charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate">{item.title}</p>
              <p className="text-[10px] text-medium-gray">
                {item.category} &middot; {item.memberCount} members
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
