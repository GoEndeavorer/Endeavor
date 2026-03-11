"use client";

import { useState } from "react";

type SocialShareProps = {
  title: string;
  url: string;
  description?: string;
};

export function SocialShare({ title, url, description }: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const fullUrl = typeof window !== "undefined"
    ? `${window.location.origin}${url}`
    : url;

  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(fullUrl);
  const encodedDesc = encodeURIComponent(description || title);

  const shareLinks = [
    {
      name: "X",
      href: `https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: "hover:text-white",
    },
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: "hover:text-code-blue",
    },
    {
      name: "Reddit",
      href: `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      color: "hover:text-orange-400",
    },
    {
      name: "Email",
      href: `mailto:?subject=${encodedTitle}&body=${encodedDesc}%0A%0A${encodedUrl}`,
      color: "hover:text-code-green",
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <div className="flex items-center gap-2">
      {shareLinks.map((link) => (
        <a
          key={link.name}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`border border-medium-gray/30 px-2 py-1 text-[10px] text-medium-gray transition-colors ${link.color}`}
          title={`Share on ${link.name}`}
        >
          {link.name}
        </a>
      ))}
      <button
        onClick={copyLink}
        className="border border-medium-gray/30 px-2 py-1 text-[10px] text-medium-gray transition-colors hover:text-code-green"
      >
        {copied ? "Copied!" : "Copy"}
      </button>
    </div>
  );
}
