"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/time";

type PinnedDiscussion = {
  id: string;
  content: string;
  created_at: string;
  author_name: string;
  author_image: string | null;
  reply_count: number;
};

export function PinnedDiscussions({ endeavorId }: { endeavorId: string }) {
  const [discussions, setDiscussions] = useState<PinnedDiscussion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/pinned-discussions`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setDiscussions(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [endeavorId]);

  if (loading || discussions.length === 0) return null;

  return (
    <div className="border border-medium-gray/20 p-4">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
        {"// pinned"}
      </h4>
      <div className="space-y-2">
        {discussions.map((d) => (
          <Link
            key={d.id}
            href={`/endeavors/${endeavorId}/discussions/${d.id}`}
            className="block border border-medium-gray/10 p-3 hover:border-medium-gray/30 transition-colors"
          >
            <p className="text-sm text-light-gray line-clamp-2">
              {d.content.length > 100 ? `${d.content.slice(0, 100)}...` : d.content}
            </p>
            <div className="mt-1 flex items-center gap-2 text-xs text-medium-gray">
              <span>{d.author_name}</span>
              <span>&middot;</span>
              <span>{formatTimeAgo(d.created_at)}</span>
              {Number(d.reply_count) > 0 && (
                <>
                  <span>&middot;</span>
                  <span>{d.reply_count} {Number(d.reply_count) === 1 ? "reply" : "replies"}</span>
                </>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
