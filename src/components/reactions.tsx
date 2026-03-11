"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";

type ReactionData = {
  emoji: string;
  count: number;
  user_names: string[];
};

type ReactionsProps = {
  targetType: string;
  targetId: string;
};

const availableEmojis = ["👍", "❤️", "🎉", "🚀", "👀", "💡", "🔥", "👏"];

export function Reactions({ targetType, targetId }: ReactionsProps) {
  const { data: session } = useSession();
  const [reactions, setReactions] = useState<ReactionData[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    fetch(`/api/reactions?targetType=${targetType}&targetId=${targetId}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setReactions);
  }, [targetType, targetId]);

  async function toggleReaction(emoji: string) {
    if (!session || toggling) return;
    setToggling(true);
    const res = await fetch("/api/reactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType, targetId, emoji }),
    });
    if (res.ok) {
      const { action } = await res.json();
      setReactions((prev) => {
        if (action === "added") {
          const existing = prev.find((r) => r.emoji === emoji);
          if (existing) {
            return prev.map((r) =>
              r.emoji === emoji
                ? { ...r, count: r.count + 1, user_names: [...r.user_names, session.user.name] }
                : r
            );
          }
          return [...prev, { emoji, count: 1, user_names: [session.user.name] }];
        } else {
          return prev
            .map((r) =>
              r.emoji === emoji
                ? { ...r, count: r.count - 1, user_names: r.user_names.filter((n) => n !== session.user.name) }
                : r
            )
            .filter((r) => r.count > 0);
        }
      });
    }
    setToggling(false);
    setShowPicker(false);
  }

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {reactions.map((r) => (
        <button
          key={r.emoji}
          onClick={() => toggleReaction(r.emoji)}
          disabled={!session || toggling}
          className="flex items-center gap-1 px-1.5 py-0.5 border border-medium-gray/20 hover:border-code-green/30 transition-colors text-xs disabled:opacity-50"
          title={r.user_names.join(", ")}
        >
          <span>{r.emoji}</span>
          <span className="text-medium-gray">{r.count}</span>
        </button>
      ))}
      {session && (
        <div className="relative">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="w-6 h-6 flex items-center justify-center border border-medium-gray/20 hover:border-code-green/30 text-medium-gray hover:text-code-green transition-colors text-xs"
          >
            +
          </button>
          {showPicker && (
            <div className="absolute bottom-full left-0 mb-1 flex gap-1 p-1 bg-black border border-medium-gray/30 z-10">
              {availableEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => toggleReaction(emoji)}
                  className="w-7 h-7 flex items-center justify-center hover:bg-medium-gray/10 transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
