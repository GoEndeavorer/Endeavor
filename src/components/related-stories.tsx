"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type RelatedStory = {
  id: string;
  title: string;
  authorName: string;
  createdAt: string;
};

export function RelatedStories({ storyId }: { storyId: string }) {
  const [stories, setStories] = useState<RelatedStory[]>([]);

  useEffect(() => {
    fetch(`/api/stories/${storyId}/related`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setStories(data);
      })
      .catch(() => {});
  }, [storyId]);

  if (stories.length === 0) return null;

  return (
    <div className="mt-12 border-t border-medium-gray/20 pt-8">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-code-green">
        {"// related stories"}
      </h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {stories.map((s) => (
          <Link
            key={s.id}
            href={`/stories/${s.id}`}
            className="group border border-medium-gray/20 p-4 transition-colors hover:border-code-green/50"
          >
            <p className="text-sm font-semibold group-hover:text-code-green transition-colors line-clamp-2">
              {s.title}
            </p>
            <p className="mt-2 text-xs text-medium-gray">
              by {s.authorName} &middot;{" "}
              {new Date(s.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
