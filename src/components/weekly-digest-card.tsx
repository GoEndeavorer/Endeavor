"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type DigestData = {
  stats: {
    new_endeavors: number;
    new_members: number;
    new_stories: number;
    discussions_on_your_projects: number;
  };
  top_endeavors: { id: string; title: string; category: string; activity_count: number }[];
};

export function WeeklyDigestCard() {
  const [data, setData] = useState<DigestData | null>(null);

  useEffect(() => {
    fetch("/api/weekly-digest")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData);
  }, []);

  if (!data) return null;

  return (
    <div className="border border-medium-gray/20 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-code-green mb-3">
        {"// this week"}
      </h3>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-lg font-bold text-code-green">{data.stats.new_endeavors}</p>
          <p className="text-xs text-medium-gray">New endeavors</p>
        </div>
        <div>
          <p className="text-lg font-bold text-code-blue">{data.stats.new_members}</p>
          <p className="text-xs text-medium-gray">New members</p>
        </div>
        <div>
          <p className="text-lg font-bold text-light-gray">{data.stats.new_stories}</p>
          <p className="text-xs text-medium-gray">Stories published</p>
        </div>
        <div>
          <p className="text-lg font-bold text-yellow-400">{data.stats.discussions_on_your_projects}</p>
          <p className="text-xs text-medium-gray">Your discussions</p>
        </div>
      </div>
      {data.top_endeavors.length > 0 && (
        <div>
          <p className="text-xs text-medium-gray mb-2">Most active</p>
          <div className="space-y-1">
            {data.top_endeavors.slice(0, 3).map((e) => (
              <Link
                key={e.id}
                href={`/endeavors/${e.id}`}
                className="flex items-center justify-between text-xs hover:text-code-green transition-colors"
              >
                <span className="text-light-gray truncate">{e.title}</span>
                <span className="text-medium-gray shrink-0 ml-2">{e.activity_count} posts</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
