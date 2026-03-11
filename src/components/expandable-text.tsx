"use client";

import { useState } from "react";

export function ExpandableText({
  text,
  maxLength = 200,
  className = "",
}: {
  text: string;
  maxLength?: number;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);

  if (text.length <= maxLength) {
    return <p className={className}>{text}</p>;
  }

  return (
    <div className={className}>
      <p>{expanded ? text : `${text.slice(0, maxLength)}...`}</p>
      <button
        onClick={() => setExpanded((prev) => !prev)}
        className="mt-1 text-xs text-code-blue hover:text-code-green transition-colors font-mono"
      >
        {expanded ? "[show less]" : "[read more]"}
      </button>
    </div>
  );
}
