"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Contributor = {
  user_id: string;
  name: string;
  image: string | null;
  role: string;
  tasks_completed: number;
  tasks_assigned: number;
  discussions: number;
  joined_at: string;
};

export function MemberContributions({ endeavorId }: { endeavorId: string }) {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/contributions`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setContributors(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [endeavorId]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 bg-medium-gray/10 animate-pulse" />
        ))}
      </div>
    );
  }

  if (contributors.length === 0) return null;

  const maxContributions = Math.max(
    ...contributors.map((c) => c.tasks_completed + c.discussions),
    1
  );

  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
        {"// team contributions"}
      </h3>
      <div className="space-y-2">
        {contributors.map((c) => {
          const total = c.tasks_completed + c.discussions;
          const barWidth = Math.max(5, (total / maxContributions) * 100);

          return (
            <div key={c.user_id} className="flex items-center gap-3">
              <Link
                href={`/users/${c.user_id}`}
                className="flex h-8 w-8 items-center justify-center bg-code-blue/10 text-xs font-bold text-code-blue shrink-0 hover:bg-code-blue/20 transition-colors"
              >
                {c.name.charAt(0).toUpperCase()}
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/users/${c.user_id}`}
                    className="text-sm font-semibold truncate hover:text-code-green transition-colors"
                  >
                    {c.name}
                  </Link>
                  {c.role === "creator" && (
                    <span className="text-[10px] px-1 border border-code-green/30 text-code-green">
                      creator
                    </span>
                  )}
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  <div className="h-1 flex-1 bg-medium-gray/20">
                    <div
                      className="h-1 bg-code-green transition-all"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-medium-gray shrink-0">
                    {c.tasks_completed} tasks &middot; {c.discussions} posts
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
