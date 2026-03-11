"use client";

import { useClipboard } from "@/lib/use-clipboard";

export function CopyButton({
  text,
  label = "Copy",
  copiedLabel = "Copied!",
  className = "",
}: {
  text: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
}) {
  const { copied, copy } = useClipboard();

  return (
    <button
      onClick={() => copy(text)}
      className={`text-xs font-mono transition-colors ${
        copied
          ? "text-code-green"
          : "text-medium-gray hover:text-light-gray"
      } ${className}`}
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
