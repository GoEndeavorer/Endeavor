"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/time";

type UserEndorsement = {
  id: string;
  content: string;
  rating: number;
  createdAt: string;
  fromUserId: string;
  fromUserName: string;
  fromUserImage: string | null;
  endeavorId: string;
  endeavorTitle: string;
  endeavorCategory: string;
};

export function EndorsementList({ userId }: { userId: string }) {
  const [endorsements, setEndorsements] = useState<UserEndorsement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${userId}/endorsements`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setEndorsements(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse bg-medium-gray/10" />
        ))}
      </div>
    );
  }

  if (endorsements.length === 0) return null;

  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
        {"// endorsements"} ({endorsements.length})
      </h3>
      <div className="space-y-2">
        {endorsements.map((e) => (
          <div
            key={e.id}
            className="border border-medium-gray/20 p-3"
          >
            <div className="mb-1.5 flex items-center gap-2">
              <Link
                href={`/users/${e.fromUserId}`}
                className="flex items-center gap-2 group"
              >
                {e.fromUserImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={e.fromUserImage}
                    alt=""
                    className="h-6 w-6 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-code-blue/10 text-[10px] font-bold text-code-blue rounded-full">
                    {e.fromUserName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-semibold group-hover:text-code-blue transition-colors">
                  {e.fromUserName}
                </span>
              </Link>
              <span className="text-xs text-yellow-400">
                {"★".repeat(e.rating)}
              </span>
            </div>
            <p className="text-sm text-light-gray leading-relaxed">
              {e.content}
            </p>
            <div className="mt-1.5 flex items-center gap-2 text-[10px] text-medium-gray">
              <Link
                href={`/endeavors/${e.endeavorId}`}
                className="hover:text-code-blue transition-colors"
              >
                <span className="border border-medium-gray/20 px-1.5 py-0.5">
                  {e.endeavorCategory}
                </span>{" "}
                {e.endeavorTitle}
              </Link>
              <span>&middot;</span>
              <span>{formatTimeAgo(e.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
