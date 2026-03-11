"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Match = {
  id: string;
  title: string;
  category: string;
  status: string;
  imageUrl: string | null;
  tagline: string | null;
  needs: string[];
  memberCount: number;
  matchCount: number;
};

export function SkillMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/needs/match")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setMatches(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse bg-medium-gray/10" />
        ))}
      </div>
    );
  }

  if (matches.length === 0) return null;

  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
        {"// matching your skills"}
      </h3>
      <div className="space-y-2">
        {matches.slice(0, 8).map((match) => (
          <Link
            key={match.id}
            href={`/endeavors/${match.id}`}
            className="block border border-medium-gray/20 p-3 transition-colors hover:border-code-green/30"
          >
            <div className="flex items-start gap-3">
              {match.imageUrl ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={match.imageUrl}
                  alt=""
                  className="h-10 w-12 shrink-0 object-cover"
                />
              ) : (
                <div className="flex h-10 w-12 shrink-0 items-center justify-center bg-code-green/10 text-xs font-bold text-code-green">
                  {match.title.charAt(0)}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{match.title}</p>
                <p className="text-xs text-medium-gray truncate">
                  {match.category} &middot; {match.memberCount} members
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {match.needs.slice(0, 3).map((need) => (
                    <span
                      key={need}
                      className="border border-code-green/30 bg-code-green/5 px-1.5 py-0.5 text-[10px] text-code-green"
                    >
                      {need}
                    </span>
                  ))}
                  {match.matchCount > 0 && (
                    <span className="text-[10px] text-code-blue font-semibold">
                      {match.matchCount} skill{match.matchCount > 1 ? "s" : ""} match
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
