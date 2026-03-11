"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const CURRENT_VERSION = "0.25.0";
const BANNER_KEY = `endeavor_whats_new_${CURRENT_VERSION}`;

const highlights = [
  "Q&A with voting",
  "Challenges & XP rewards",
  "Community groups",
  "Direct messaging",
  "Achievements system",
  "Integrations hub",
  "Notes & reactions",
];

export function WhatsNewBanner() {
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    try {
      const seen = localStorage.getItem(BANNER_KEY);
      setDismissed(!!seen);
    } catch {
      setDismissed(true);
    }
  }, []);

  function dismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(BANNER_KEY, "1");
    } catch {}
  }

  if (dismissed) return null;

  return (
    <div className="border-b border-code-green/30 bg-code-green/5 px-4 py-3">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="shrink-0 bg-code-green px-2 py-0.5 text-xs font-bold text-black">
            NEW
          </span>
          <p className="text-sm text-light-gray truncate">
            v{CURRENT_VERSION}: {highlights.join(" · ")}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/changelog"
            className="text-xs text-code-green hover:text-white transition-colors"
          >
            See all changes
          </Link>
          <button
            onClick={dismiss}
            className="text-xs text-medium-gray hover:text-white"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
