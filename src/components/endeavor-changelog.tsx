"use client";

import { useState, useEffect } from "react";
import { formatTimeAgo } from "@/lib/time";

type ChangelogEntry = {
  type: string;
  title: string;
  description: string;
  event_date: string;
};

const typeIcons: Record<string, string> = {
  milestone: "*",
  story: "~",
  member: "+",
};

const typeColors: Record<string, string> = {
  milestone: "text-code-green",
  story: "text-yellow-400",
  member: "text-code-blue",
};

export function EndeavorChangelog({ endeavorId }: { endeavorId: string }) {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/changelog`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setEntries(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [endeavorId]);

  if (loading || entries.length === 0) return null;

  const displayed = showAll ? entries : entries.slice(0, 5);

  return (
    <div className="border border-medium-gray/20 p-4">
      <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
        {"// changelog"}
      </h4>
      <div className="space-y-2">
        {displayed.map((entry, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className={`font-mono text-xs font-bold mt-0.5 ${typeColors[entry.type] || "text-medium-gray"}`}>
              {typeIcons[entry.type] || ">"}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-light-gray">
                <span className="font-semibold">{entry.title}</span>
                <span className="text-medium-gray"> — {entry.description}</span>
              </p>
              <p className="text-xs text-medium-gray">{formatTimeAgo(entry.event_date)}</p>
            </div>
          </div>
        ))}
      </div>
      {entries.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-3 text-xs text-code-blue hover:text-code-green transition-colors"
        >
          {showAll ? "Show less" : `Show all (${entries.length})`}
        </button>
      )}
    </div>
  );
}
