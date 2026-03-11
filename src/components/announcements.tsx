"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";
import { MarkdownText } from "@/components/markdown-text";

type Announcement = {
  id: string;
  title: string;
  content: string;
  priority: string;
  pinned: boolean;
  created_at: string;
  author_name: string;
  author_image: string | null;
};

const priorityStyles: Record<string, string> = {
  urgent: "border-red-400/30 bg-red-400/5",
  important: "border-yellow-400/30 bg-yellow-400/5",
  normal: "border-medium-gray/20",
};

const priorityLabels: Record<string, string> = {
  urgent: "URGENT",
  important: "IMPORTANT",
  normal: "",
};

export function Announcements({
  endeavorId,
  canPost = false,
}: {
  endeavorId: string;
  canPost?: boolean;
}) {
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState("normal");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/announcements`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setAnnouncements)
      .finally(() => setLoading(false));
  }, [endeavorId]);

  async function post() {
    if (!title.trim() || !content.trim()) return;
    setPosting(true);
    const res = await fetch(`/api/endeavors/${endeavorId}/announcements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), content: content.trim(), priority }),
    });
    if (res.ok) {
      const announcement = await res.json();
      setAnnouncements((prev) => [{ ...announcement, author_name: "You" }, ...prev]);
      setTitle("");
      setContent("");
      setPriority("normal");
      setShowForm(false);
      toast("Announcement posted", "success");
    }
    setPosting(false);
  }

  if (loading || (announcements.length === 0 && !canPost)) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// announcements"}
        </h3>
        {canPost && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-xs text-code-blue hover:text-code-green transition-colors"
          >
            {showForm ? "Cancel" : "+ Post"}
          </button>
        )}
      </div>

      {showForm && (
        <div className="border border-medium-gray/20 p-4 mb-4 space-y-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Announcement title"
            className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your announcement..."
            rows={3}
            className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray resize-none"
          />
          <div className="flex items-center gap-3">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="border border-medium-gray/30 bg-black px-2 py-1.5 text-xs text-white"
            >
              <option value="normal">Normal</option>
              <option value="important">Important</option>
              <option value="urgent">Urgent</option>
            </select>
            <button
              onClick={post}
              disabled={posting || !title.trim() || !content.trim()}
              className="px-4 py-1.5 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors disabled:opacity-50"
            >
              {posting ? "Posting..." : "Post Announcement"}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {announcements.map((a) => (
          <div key={a.id} className={`border p-4 ${priorityStyles[a.priority] || "border-medium-gray/20"}`}>
            <div className="flex items-center gap-2 mb-2">
              {a.pinned && <span className="text-xs text-yellow-400 font-bold">PINNED</span>}
              {priorityLabels[a.priority] && (
                <span className={`text-xs font-bold ${a.priority === "urgent" ? "text-red-400" : "text-yellow-400"}`}>
                  {priorityLabels[a.priority]}
                </span>
              )}
              <h4 className="text-sm font-semibold text-light-gray">{a.title}</h4>
            </div>
            <div className="text-sm text-medium-gray mb-2">
              <MarkdownText content={a.content} />
            </div>
            <div className="flex items-center gap-2 text-xs text-medium-gray">
              <span>{a.author_name}</span>
              <span>&middot;</span>
              <span>{formatTimeAgo(a.created_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
