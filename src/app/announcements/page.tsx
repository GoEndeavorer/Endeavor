"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";

export const dynamic = "force-dynamic";

type Announcement = {
  id: string;
  author_id: string;
  title: string;
  body: string;
  priority: string;
  pinned: boolean;
  target: string;
  created_at: string;
  author_name: string;
  author_image: string | null;
};

const priorityColors: Record<string, string> = {
  urgent: "text-red-400",
  important: "text-yellow-400",
  normal: "text-code-green",
};

const priorityBorderColors: Record<string, string> = {
  urgent: "border-red-400/30",
  important: "border-yellow-400/30",
  normal: "border-medium-gray/20",
};

const priorityBadgeColors: Record<string, string> = {
  urgent: "bg-red-400/10 text-red-400 border-red-400/30",
  important: "bg-yellow-400/10 text-yellow-400 border-yellow-400/30",
  normal: "bg-code-green/10 text-code-green border-code-green/30",
};

const priorityIcons: Record<string, string> = {
  urgent: "!!",
  important: "!",
  normal: ">",
};

export default function AnnouncementsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState("normal");
  const [pinned, setPinned] = useState(false);
  const [target, setTarget] = useState("all");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/announcements")
      .then((r) => (r.ok ? r.json() : []))
      .then(setAnnouncements)
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, priority, pinned, target }),
      });

      if (!res.ok) {
        toast("Failed to create announcement", "error");
        return;
      }

      const created = await res.json();
      created.author_name = session?.user?.name || "You";
      created.author_image = session?.user?.image || null;
      setAnnouncements((prev) => [created, ...prev]);
      setTitle("");
      setBody("");
      setPriority("normal");
      setPinned(false);
      setTarget("all");
      setShowForm(false);
      toast("Announcement published");
    } finally {
      setSubmitting(false);
    }
  }

  const pinnedAnnouncements = announcements.filter((a) => a.pinned);
  const regularAnnouncements = announcements.filter((a) => !a.pinned);

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Announcements", href: "/announcements" }} />

      <main className="mx-auto max-w-2xl px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Announcements</h1>
            {announcements.length > 0 && (
              <span className="text-xs text-medium-gray">
                {announcements.length} total
              </span>
            )}
          </div>
          {session && (
            <button
              onClick={() => setShowForm(!showForm)}
              className={`text-xs transition-colors ${
                showForm
                  ? "text-red-400 hover:text-red-300"
                  : "text-code-green hover:text-white"
              }`}
            >
              {showForm ? "Cancel" : "+ New Announcement"}
            </button>
          )}
        </div>

        {/* Create form */}
        {showForm && session && (
          <form
            onSubmit={handleSubmit}
            className="mb-8 border border-medium-gray/30 p-4 space-y-3"
          >
            <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green mb-3">
              {"// new announcement"}
            </h2>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Announcement title..."
              className="w-full bg-transparent border border-medium-gray/30 px-3 py-2 text-sm text-light-gray placeholder:text-medium-gray/50 focus:border-code-green/50 focus:outline-none"
            />
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your announcement..."
              rows={4}
              className="w-full bg-transparent border border-medium-gray/30 px-3 py-2 text-sm text-light-gray placeholder:text-medium-gray/50 focus:border-code-green/50 focus:outline-none resize-none"
            />
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-xs text-medium-gray">Priority:</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="bg-transparent border border-medium-gray/30 px-2 py-1 text-xs text-light-gray focus:border-code-green/50 focus:outline-none"
                >
                  <option value="normal">Normal</option>
                  <option value="important">Important</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-medium-gray">Target:</label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="bg-transparent border border-medium-gray/30 px-2 py-1 text-xs text-light-gray focus:border-code-green/50 focus:outline-none"
                >
                  <option value="all">Everyone</option>
                  <option value="members">Members</option>
                  <option value="creators">Creators</option>
                </select>
              </div>
              <label className="flex items-center gap-1.5 text-xs text-medium-gray cursor-pointer">
                <input
                  type="checkbox"
                  checked={pinned}
                  onChange={(e) => setPinned(e.target.checked)}
                  className="accent-green-400"
                />
                Pin announcement
              </label>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !title.trim() || !body.trim()}
                className="border border-code-green/50 px-4 py-1.5 text-xs text-code-green hover:bg-code-green/10 transition-colors disabled:opacity-30"
              >
                {submitting ? "Publishing..." : "Publish"}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="border border-medium-gray/10 p-4 animate-pulse space-y-2"
              >
                <div className="h-4 bg-medium-gray/20 w-2/3" />
                <div className="h-3 bg-medium-gray/10 w-full" />
                <div className="h-3 bg-medium-gray/10 w-1/2" />
              </div>
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <div className="border border-medium-gray/20 p-12 text-center">
            <p className="text-2xl text-medium-gray/30 mb-3 font-mono">&gt;</p>
            <p className="text-medium-gray text-sm">
              No announcements yet. Check back later for platform updates.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pinned announcements */}
            {pinnedAnnouncements.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green mb-3">
                  {"// pinned"}
                </h2>
                <div className="space-y-2">
                  {pinnedAnnouncements.map((a) => (
                    <div
                      key={a.id}
                      className={`border ${priorityBorderColors[a.priority] || "border-medium-gray/20"} p-4`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 text-sm font-mono font-bold ${priorityColors[a.priority] || "text-code-green"}`}
                        >
                          {priorityIcons[a.priority] || ">"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-light-gray">
                              {a.title}
                            </h3>
                            <span
                              className={`px-1.5 py-0.5 text-[10px] border ${priorityBadgeColors[a.priority] || ""}`}
                            >
                              {a.priority}
                            </span>
                            <span className="px-1.5 py-0.5 text-[10px] border border-code-blue/30 bg-code-blue/10 text-code-blue">
                              pinned
                            </span>
                          </div>
                          <p className="text-sm text-medium-gray whitespace-pre-wrap">
                            {a.body}
                          </p>
                          <div className="mt-2 flex items-center gap-3">
                            <span className="text-xs text-medium-gray">
                              {a.author_name}
                            </span>
                            <span className="text-xs text-medium-gray/50">
                              {formatTimeAgo(new Date(a.created_at))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Regular announcements */}
            {regularAnnouncements.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green mb-3">
                  {"// recent"}
                </h2>
                <div className="space-y-2">
                  {regularAnnouncements.map((a) => (
                    <div
                      key={a.id}
                      className={`border ${priorityBorderColors[a.priority] || "border-medium-gray/20"} p-4`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-0.5 text-sm font-mono font-bold ${priorityColors[a.priority] || "text-code-green"}`}
                        >
                          {priorityIcons[a.priority] || ">"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-light-gray">
                              {a.title}
                            </h3>
                            {a.priority !== "normal" && (
                              <span
                                className={`px-1.5 py-0.5 text-[10px] border ${priorityBadgeColors[a.priority] || ""}`}
                              >
                                {a.priority}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-medium-gray whitespace-pre-wrap">
                            {a.body}
                          </p>
                          <div className="mt-2 flex items-center gap-3">
                            <span className="text-xs text-medium-gray">
                              {a.author_name}
                            </span>
                            <span className="text-xs text-medium-gray/50">
                              {formatTimeAgo(new Date(a.created_at))}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
