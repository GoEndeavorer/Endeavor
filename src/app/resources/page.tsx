"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";

type Resource = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  type: string;
  category: string;
  upvotes: number;
  author_name: string;
  created_at: string;
};

const CATEGORIES = ["all", "general", "programming", "design", "business", "science", "productivity", "career"];
const TYPES = ["all", "article", "video", "tutorial", "tool", "book", "course", "podcast"];

const typeIcons: Record<string, string> = {
  article: "A",
  video: "V",
  tutorial: "T",
  tool: ">",
  book: "B",
  course: "C",
  podcast: "P",
};

export default function ResourcesPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [type, setType] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [resType, setResType] = useState("article");
  const [resCat, setResCat] = useState("general");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (type !== "all") params.set("type", type);
    const qs = params.toString() ? `?${params}` : "";
    fetch(`/api/resources${qs}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setResources)
      .finally(() => setLoading(false));
  }, [category, type]);

  async function submitResource() {
    if (!title.trim() || !url.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), description: description || undefined, url: url.trim(), type: resType, category: resCat }),
    });
    if (res.ok) {
      const resource = await res.json();
      setResources((prev) => [{ ...resource, author_name: session!.user.name }, ...prev]);
      setTitle("");
      setDescription("");
      setUrl("");
      setShowForm(false);
      toast("Resource shared!", "success");
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Resources", href: "/resources" }} />

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Resources</h1>
            <p className="text-sm text-medium-gray">Community-curated learning resources</p>
          </div>
          {session && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors"
            >
              {showForm ? "Cancel" : "+ Share Resource"}
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex gap-1 flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-2 py-1 text-xs font-semibold transition-colors ${
                  category === cat ? "bg-code-green text-black" : "border border-medium-gray/30 text-medium-gray hover:text-light-gray"
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex gap-1 flex-wrap">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-2 py-1 text-xs font-semibold transition-colors ${
                  type === t ? "bg-code-blue text-black" : "border border-medium-gray/30 text-medium-gray hover:text-light-gray"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {showForm && (
          <div className="border border-medium-gray/20 p-4 mb-6 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green">{"// share resource"}</h2>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Resource title"
              className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
            />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="URL"
              type="url"
              className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description (optional)"
              rows={2}
              className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray resize-y"
            />
            <div className="flex gap-3">
              <select value={resType} onChange={(e) => setResType(e.target.value)} className="border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white">
                {TYPES.filter((t) => t !== "all").map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={resCat} onChange={(e) => setResCat(e.target.value)} className="border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white">
                {CATEGORIES.filter((c) => c !== "all").map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button
              onClick={submitResource}
              disabled={submitting || !title.trim() || !url.trim()}
              className="px-4 py-2 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors disabled:opacity-50"
            >
              {submitting ? "Sharing..." : "Share Resource"}
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-medium-gray">Loading...</p>
        ) : resources.length === 0 ? (
          <div className="border border-medium-gray/20 p-8 text-center">
            <p className="text-sm text-medium-gray">No resources found. Share the first one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {resources.map((resource) => (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block border border-medium-gray/20 p-4 hover:border-code-green/30 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <span className="shrink-0 w-8 h-8 border border-code-blue/30 flex items-center justify-center text-xs font-bold text-code-blue">
                    {typeIcons[resource.type] || "?"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-light-gray group-hover:text-code-green transition-colors">{resource.title}</h3>
                    {resource.description && (
                      <p className="text-xs text-medium-gray mt-1 line-clamp-2">{resource.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-medium-gray">
                      <span className="text-code-blue">{resource.author_name}</span>
                      <span>{resource.category}</span>
                      <span>{formatTimeAgo(resource.created_at)}</span>
                      <span className="text-code-green">{resource.upvotes} upvotes</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
