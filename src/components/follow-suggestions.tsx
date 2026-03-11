"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/components/toast";

type SuggestedUser = {
  id: string;
  name: string;
  image: string | null;
  bio: string | null;
  skills: string[] | null;
};

export function FollowSuggestions() {
  const { toast } = useToast();
  const [users, setUsers] = useState<SuggestedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/suggestions/users")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleFollow(userId: string) {
    setFollowing((prev) => new Set([...prev, userId]));
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        toast("Followed");
      } else {
        setFollowing((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      }
    } catch {
      setFollowing((prev) => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  }

  if (loading || users.length === 0) return null;

  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
        {"// people to follow"}
      </h3>
      <div className="space-y-2">
        {users.slice(0, 5).map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between border border-medium-gray/10 px-3 py-2"
          >
            <Link
              href={`/users/${user.id}`}
              className="flex items-center gap-2 min-w-0 group"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-code-blue/10 text-xs font-bold text-code-blue">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs group-hover:text-code-green transition-colors">
                  {user.name}
                </p>
                {user.skills && user.skills.length > 0 && (
                  <p className="truncate text-[10px] text-medium-gray">
                    {user.skills.slice(0, 2).join(", ")}
                  </p>
                )}
              </div>
            </Link>
            {following.has(user.id) ? (
              <span className="shrink-0 text-[10px] text-code-green">
                Following
              </span>
            ) : (
              <button
                onClick={() => handleFollow(user.id)}
                className="shrink-0 text-[10px] text-code-blue hover:text-code-green transition-colors"
              >
                + Follow
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
