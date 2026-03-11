"use client";

// Simple markdown-like text renderer
// Supports: **bold**, *italic*, `code`, [links](url), \n\n paragraphs, # headings

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function parseInline(text: string): string {
  let result = escapeHtml(text);

  // Code: `text`
  result = result.replace(/`([^`]+)`/g, '<code class="bg-white/10 px-1.5 py-0.5 text-code-green text-xs">$1</code>');

  // Bold: **text**
  result = result.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // Italic: *text*
  result = result.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  // Links: [text](url) — only allow http/https
  result = result.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-code-blue hover:text-code-green underline">$1</a>'
  );

  return result;
}

export function MarkdownText({ content, className = "" }: { content: string; className?: string }) {
  const lines = content.split("\n");
  const elements: { type: "p" | "h2" | "h3"; html: string }[] = [];
  let currentParagraph: string[] = [];

  function flushParagraph() {
    if (currentParagraph.length > 0) {
      elements.push({
        type: "p",
        html: currentParagraph.map(parseInline).join("<br />"),
      });
      currentParagraph = [];
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "") {
      flushParagraph();
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushParagraph();
      elements.push({ type: "h3", html: parseInline(trimmed.slice(4)) });
    } else if (trimmed.startsWith("## ")) {
      flushParagraph();
      elements.push({ type: "h2", html: parseInline(trimmed.slice(3)) });
    } else {
      currentParagraph.push(trimmed);
    }
  }
  flushParagraph();

  return (
    <div className={`space-y-3 ${className}`}>
      {elements.map((el, i) => {
        if (el.type === "h2") {
          return (
            <h2
              key={i}
              className="text-lg font-bold"
              dangerouslySetInnerHTML={{ __html: el.html }}
            />
          );
        }
        if (el.type === "h3") {
          return (
            <h3
              key={i}
              className="text-base font-semibold"
              dangerouslySetInnerHTML={{ __html: el.html }}
            />
          );
        }
        return (
          <p
            key={i}
            className="text-sm leading-relaxed text-light-gray"
            dangerouslySetInnerHTML={{ __html: el.html }}
          />
        );
      })}
    </div>
  );
}
