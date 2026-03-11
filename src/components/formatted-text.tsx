"use client";

/**
 * Simple text formatter that handles basic markdown-like syntax:
 * **bold**, *italic*, `code`, [links](url), @mentions
 */
export function FormattedText({ text, className = "" }: { text: string; className?: string }) {
  const parts = parseText(text);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        switch (part.type) {
          case "bold":
            return <strong key={i} className="font-bold">{part.text}</strong>;
          case "italic":
            return <em key={i} className="italic">{part.text}</em>;
          case "code":
            return (
              <code key={i} className="bg-medium-gray/10 px-1 py-0.5 text-code-green font-mono text-xs">
                {part.text}
              </code>
            );
          case "link":
            return (
              <a
                key={i}
                href={part.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-code-blue hover:text-code-green underline transition-colors"
              >
                {part.text}
              </a>
            );
          case "mention":
            return (
              <a
                key={i}
                href={`/people?q=${encodeURIComponent(part.text.slice(1))}`}
                className="text-code-blue hover:text-code-green transition-colors font-semibold"
              >
                {part.text}
              </a>
            );
          default:
            return <span key={i}>{part.text}</span>;
        }
      })}
    </span>
  );
}

type TextPart = {
  type: "text" | "bold" | "italic" | "code" | "link" | "mention";
  text: string;
  href?: string;
};

function parseText(text: string): TextPart[] {
  const parts: TextPart[] = [];
  // Simple regex-based parser
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|\[(.+?)\]\((.+?)\)|@(\w+))/g;
  let lastIndex = 0;

  let match;
  while ((match = regex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push({ type: "text", text: text.slice(lastIndex, match.index) });
    }

    if (match[2]) {
      parts.push({ type: "bold", text: match[2] });
    } else if (match[3]) {
      parts.push({ type: "italic", text: match[3] });
    } else if (match[4]) {
      parts.push({ type: "code", text: match[4] });
    } else if (match[5] && match[6]) {
      parts.push({ type: "link", text: match[5], href: match[6] });
    } else if (match[7]) {
      parts.push({ type: "mention", text: `@${match[7]}` });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({ type: "text", text: text.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: "text", text }];
}
