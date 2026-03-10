"use client";

import { useState } from "react";

export function ShareButton({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={handleShare}
      className="border border-medium-gray/50 px-4 py-2 text-xs text-medium-gray transition-colors hover:border-code-blue hover:text-code-blue"
    >
      {copied ? "Link copied!" : "Share"}
    </button>
  );
}
