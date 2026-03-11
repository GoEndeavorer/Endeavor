/**
 * Parse @mentions from text content.
 * Returns an array of mentioned usernames.
 */
export function parseMentions(content: string): string[] {
  const regex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    if (!mentions.includes(match[1])) {
      mentions.push(match[1]);
    }
  }
  return mentions;
}

/**
 * Convert @mentions in text to linked mentions for display.
 * Returns HTML string with mention links.
 */
export function renderMentions(content: string): string {
  return content.replace(
    /@(\w+)/g,
    '<span class="text-code-blue cursor-pointer hover:underline">@$1</span>'
  );
}
