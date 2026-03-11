"use client";

import { useState } from "react";

export function ShareButton({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // User cancelled
      }
    } else {
      setShowMenu((prev) => !prev);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowMenu(false);
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="relative">
      <button
        onClick={handleNativeShare}
        className="border border-medium-gray/50 px-4 py-2 text-xs text-medium-gray transition-colors hover:border-code-blue hover:text-code-blue"
      >
        {copied ? "Link copied!" : "Share"}
      </button>

      {showMenu && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full mt-1 z-[61] w-48 border border-medium-gray/30 bg-black">
            <button
              onClick={copyLink}
              className="w-full px-3 py-2 text-left text-xs text-light-gray hover:bg-medium-gray/10 transition-colors"
            >
              Copy link
            </button>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-3 py-2 text-left text-xs text-light-gray hover:bg-medium-gray/10 transition-colors"
              onClick={() => setShowMenu(false)}
            >
              Share on X
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-3 py-2 text-left text-xs text-light-gray hover:bg-medium-gray/10 transition-colors"
              onClick={() => setShowMenu(false)}
            >
              Share on LinkedIn
            </a>
            <a
              href={`mailto:?subject=${encodedTitle}&body=${encodeURIComponent(`Check this out:\n\n${url}`)}`}
              className="block w-full px-3 py-2 text-left text-xs text-light-gray hover:bg-medium-gray/10 transition-colors"
              onClick={() => setShowMenu(false)}
            >
              Share via email
            </a>
          </div>
        </>
      )}
    </div>
  );
}
