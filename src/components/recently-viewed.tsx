"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getRecentlyViewed } from "@/lib/recently-viewed";

export function RecentlyViewed() {
  const [items, setItems] = useState<{ id: string; title: string; category: string }[]>([]);

  useEffect(() => {
    setItems(getRecentlyViewed());
  }, []);

  if (items.length === 0) return null;

  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
        {"// recently viewed"}
      </h3>
      <div className="space-y-1">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/endeavors/${item.id}`}
            className="group flex items-center justify-between border border-medium-gray/10 px-3 py-2 transition-colors hover:border-code-green/30"
          >
            <span className="truncate text-sm group-hover:text-code-green transition-colors">
              {item.title}
            </span>
            <span className="ml-2 shrink-0 text-[10px] text-medium-gray">
              {item.category}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
