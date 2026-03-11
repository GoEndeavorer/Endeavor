"use client";

import { useState, useEffect } from "react";

const emojiMap: Record<string, string> = {
  like: "+1",
  heart: "<3",
  fire: "**",
  thumbsup: "^",
  thumbsdown: "v",
  celebrate: "!",
};

const emojiLabels: Record<string, string> = {
  like: "Like",
  heart: "Love",
  fire: "Fire",
  thumbsup: "Agree",
  thumbsdown: "Disagree",
  celebrate: "Celebrate",
};

export function DiscussionReactions({ discussionId }: { discussionId: string }) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/discussions/${discussionId}/reactions`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setCounts(data.counts || {});
          setUserReactions(data.userReactions || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [discussionId]);

  async function toggleReaction(emoji: string) {
    if (toggling) return;
    setToggling(emoji);

    const wasActive = userReactions.includes(emoji);

    // Optimistic update
    if (wasActive) {
      setUserReactions((prev) => prev.filter((e) => e !== emoji));
      setCounts((prev) => ({ ...prev, [emoji]: Math.max(0, (prev[emoji] || 0) - 1) }));
    } else {
      setUserReactions((prev) => [...prev, emoji]);
      setCounts((prev) => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));
    }

    try {
      const res = await fetch(`/api/discussions/${discussionId}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
      if (!res.ok) throw new Error();
    } catch {
      // Revert
      if (wasActive) {
        setUserReactions((prev) => [...prev, emoji]);
        setCounts((prev) => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));
      } else {
        setUserReactions((prev) => prev.filter((e) => e !== emoji));
        setCounts((prev) => ({ ...prev, [emoji]: Math.max(0, (prev[emoji] || 0) - 1) }));
      }
    } finally {
      setToggling(null);
    }
  }

  if (loading) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {Object.keys(emojiMap).map((emoji) => {
        const count = counts[emoji] || 0;
        const active = userReactions.includes(emoji);
        return (
          <button
            key={emoji}
            onClick={() => toggleReaction(emoji)}
            disabled={toggling !== null}
            title={emojiLabels[emoji]}
            className={`flex items-center gap-1 px-2 py-0.5 text-xs font-mono border transition-colors ${
              active
                ? "border-code-green/40 text-code-green bg-code-green/5"
                : "border-medium-gray/20 text-medium-gray hover:text-light-gray hover:border-medium-gray/40"
            }`}
          >
            <span>{emojiMap[emoji]}</span>
            {count > 0 && <span>{count}</span>}
          </button>
        );
      })}
    </div>
  );
}
