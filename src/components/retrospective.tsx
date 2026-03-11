"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/toast";

type RetroItem = {
  id: string;
  category: string;
  content: string;
  votes: number;
  author_name: string;
  user_voted: boolean;
};

const categories = [
  { id: "went_well", label: "What went well", color: "text-code-green", border: "border-code-green/30", icon: "+" },
  { id: "improve", label: "What to improve", color: "text-yellow-400", border: "border-yellow-400/30", icon: "~" },
  { id: "action_item", label: "Action items", color: "text-code-blue", border: "border-code-blue/30", icon: ">" },
];

export function Retrospective({ endeavorId }: { endeavorId: string }) {
  const { toast } = useToast();
  const [items, setItems] = useState<Record<string, RetroItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/retro`)
      .then((r) => (r.ok ? r.json() : {}))
      .then(setItems)
      .finally(() => setLoading(false));
  }, [endeavorId]);

  async function addItem(category: string) {
    if (!content.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/endeavors/${endeavorId}/retro`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, content: content.trim() }),
    });
    if (res.ok) {
      const item = await res.json();
      setItems((prev) => ({
        ...prev,
        [category]: [{ ...item, author_name: "You", user_voted: false }, ...(prev[category] || [])],
      }));
      setContent("");
      setAddingTo(null);
      toast("Added!", "success");
    }
    setSubmitting(false);
  }

  if (loading) return null;

  return (
    <div>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
        {"// retrospective"}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className={`border ${cat.border} p-3`}>
            <div className="flex items-center justify-between mb-3">
              <h4 className={`text-xs font-semibold uppercase ${cat.color}`}>
                {cat.icon} {cat.label}
              </h4>
              <button
                onClick={() => setAddingTo(addingTo === cat.id ? null : cat.id)}
                className="text-xs text-medium-gray hover:text-white"
              >
                +
              </button>
            </div>

            {addingTo === cat.id && (
              <div className="mb-3 space-y-2">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Add your thought..."
                  rows={2}
                  className="w-full border border-medium-gray/30 bg-black px-2 py-1.5 text-xs text-white placeholder:text-medium-gray resize-none"
                />
                <div className="flex gap-1">
                  <button
                    onClick={() => addItem(cat.id)}
                    disabled={submitting || !content.trim()}
                    className={`px-2 py-1 text-xs font-semibold border ${cat.border} ${cat.color} hover:opacity-80 transition-opacity disabled:opacity-50`}
                  >
                    {submitting ? "..." : "Add"}
                  </button>
                  <button
                    onClick={() => { setAddingTo(null); setContent(""); }}
                    className="px-2 py-1 text-xs text-medium-gray"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {(items[cat.id] || []).map((item) => (
                <div key={item.id} className="flex items-start gap-2">
                  <span className={`text-xs font-bold mt-0.5 ${cat.color}`}>{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-light-gray">{item.content}</p>
                    <p className="text-xs text-medium-gray mt-0.5">
                      {item.author_name} · {item.votes} votes
                    </p>
                  </div>
                </div>
              ))}
              {(!items[cat.id] || items[cat.id].length === 0) && (
                <p className="text-xs text-medium-gray italic">No items yet</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
