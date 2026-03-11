"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type SimilarEndeavor = {
  id: string;
  title: string;
  category: string;
  status: string;
  image_url: string | null;
  member_count: number;
};

export function SimilarEndeavors({ endeavorId }: { endeavorId: string }) {
  const [items, setItems] = useState<SimilarEndeavor[]>([]);

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/similar`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setItems)
      .catch(() => {});
  }, [endeavorId]);

  if (items.length === 0) return null;

  return (
    <div className="border border-medium-gray/20 p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
        {"// similar endeavors"}
      </h3>
      <div className="space-y-2">
        {items.slice(0, 4).map((e) => (
          <Link
            key={e.id}
            href={`/endeavors/${e.id}`}
            className="group flex items-center gap-3 transition-colors hover:text-code-green"
          >
            {e.image_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={e.image_url} alt="" className="h-8 w-10 object-cover shrink-0" />
            ) : (
              <div className="flex h-8 w-10 items-center justify-center bg-code-green/10 shrink-0 text-xs font-bold text-code-green">
                {e.title.charAt(0)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm truncate group-hover:text-code-green transition-colors">
                {e.title}
              </p>
              <p className="text-[10px] text-medium-gray">
                {e.category} &middot; {e.member_count} member{e.member_count !== 1 ? "s" : ""}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
