"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type SimilarUser = {
  id: string;
  name: string;
  image: string | null;
  bio: string | null;
  overlapScore: number;
};

export function SimilarUsers({ userId }: { userId: string }) {
  const [users, setUsers] = useState<SimilarUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${userId}/similar`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 animate-pulse bg-medium-gray/10" />
        ))}
      </div>
    );
  }

  if (users.length === 0) return null;

  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
        {"// similar people"}
      </h3>
      <div className="space-y-1">
        {users.map((user) => (
          <Link
            key={user.id}
            href={`/users/${user.id}`}
            className="flex items-center gap-3 border border-medium-gray/20 p-3 transition-colors hover:border-code-green/30"
          >
            {user.image ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={user.image}
                alt=""
                className="h-8 w-8 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-code-blue/10 text-xs font-bold text-code-blue rounded-full">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate">{user.name}</p>
              {user.bio && (
                <p className="text-[10px] text-medium-gray truncate">{user.bio}</p>
              )}
            </div>
            <span className="text-[10px] text-code-green font-mono">
              {user.overlapScore} match{user.overlapScore !== 1 ? "es" : ""}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
