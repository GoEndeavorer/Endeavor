"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type TagData = {
  tag: string;
  count: number;
};

export function TagCloud() {
  const [tags, setTags] = useState<TagData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/trending/tags")
      .then((r) => (r.ok ? r.json() : []))
      .then(setTags)
      .finally(() => setLoading(false));
  }, []);

  if (loading || tags.length === 0) return null;

  const maxCount = Math.max(...tags.map((t) => t.count));

  function getSize(count: number): string {
    const ratio = count / maxCount;
    if (ratio > 0.8) return "text-base font-bold";
    if (ratio > 0.5) return "text-sm font-semibold";
    if (ratio > 0.25) return "text-xs font-medium";
    return "text-xs";
  }

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-code-green mb-3">
        {"// trending tags"}
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((t) => (
          <Link
            key={t.tag}
            href={`/search?tag=${encodeURIComponent(t.tag)}`}
            className={`px-2 py-0.5 border border-code-blue/20 text-code-blue hover:border-code-blue/50 transition-colors ${getSize(t.count)}`}
          >
            {t.tag}
          </Link>
        ))}
      </div>
    </div>
  );
}
