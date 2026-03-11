"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type PublishedStory = {
  id: string;
  title: string;
  createdAt: string;
  endeavorId: string;
  endeavorTitle: string;
};

type CompletedEndeavor = {
  id: string;
  title: string;
  category: string;
  imageUrl: string | null;
  status: string;
};

type TopContribution = {
  endeavorId: string;
  endeavorTitle: string;
  tasksCompleted: number;
};

type PortfolioData = {
  publishedStories: PublishedStory[];
  completedEndeavors: CompletedEndeavor[];
  topContributions: TopContribution[];
};

export function UserPortfolio({ userId }: { userId: string }) {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/users/${userId}/portfolio`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
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

  if (
    !data ||
    (data.publishedStories.length === 0 &&
      data.completedEndeavors.length === 0 &&
      data.topContributions.length === 0)
  ) {
    return null;
  }

  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
        {"// portfolio"}
      </h3>

      {/* Completed endeavors */}
      {data.completedEndeavors.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-[10px] uppercase tracking-wider text-medium-gray">
            Completed Endeavors
          </p>
          <div className="space-y-1">
            {data.completedEndeavors.map((e) => (
              <Link
                key={e.id}
                href={`/endeavors/${e.id}`}
                className="flex items-center gap-3 border border-medium-gray/20 p-3 transition-colors hover:border-code-green/50 group"
              >
                {e.imageUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={e.imageUrl}
                    alt=""
                    className="h-8 w-12 object-cover shrink-0"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate group-hover:text-code-green transition-colors">
                    {e.title}
                  </p>
                  <span className="text-[10px] text-medium-gray">
                    {e.category}
                  </span>
                </div>
                <span className="text-xs text-purple-400 border border-purple-400/30 px-1.5 py-0.5">
                  completed
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Published stories */}
      {data.publishedStories.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-[10px] uppercase tracking-wider text-medium-gray">
            Published Stories
          </p>
          <div className="space-y-1">
            {data.publishedStories.map((s) => (
              <Link
                key={s.id}
                href={`/endeavors/${s.endeavorId}/stories/${s.id}`}
                className="flex items-center justify-between border border-medium-gray/20 p-3 transition-colors hover:border-code-green/50 group"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate group-hover:text-code-green transition-colors">
                    {s.title}
                  </p>
                  <span className="text-[10px] text-code-blue">
                    {s.endeavorTitle}
                  </span>
                </div>
                <span className="text-[10px] text-medium-gray">
                  {new Date(s.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Top contributions */}
      {data.topContributions.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-wider text-medium-gray">
            Top Contributions
          </p>
          <div className="space-y-1">
            {data.topContributions.map((c) => (
              <Link
                key={c.endeavorId}
                href={`/endeavors/${c.endeavorId}`}
                className="flex items-center justify-between border border-medium-gray/20 p-3 transition-colors hover:border-code-green/50 group"
              >
                <p className="text-sm font-semibold truncate group-hover:text-code-green transition-colors">
                  {c.endeavorTitle}
                </p>
                <span className="text-xs text-code-green font-mono shrink-0 ml-2">
                  {c.tasksCompleted} task{c.tasksCompleted !== 1 ? "s" : ""} done
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
