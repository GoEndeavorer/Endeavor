"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";

type MediaItem = {
  id: string;
  filename: string;
  url: string;
  type: string;
  size_bytes: number | null;
  alt_text: string | null;
  created_at: string;
};

const typeFilters = ["all", "image", "video", "document", "audio"];

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MediaLibraryPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [showUpload, setShowUpload] = useState(false);
  const [url, setUrl] = useState("");
  const [filename, setFilename] = useState("");
  const [altText, setAltText] = useState("");
  const [mediaType, setMediaType] = useState("image");
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    if (!session) return;
    const apiUrl = typeFilter === "all" ? "/api/media-library" : `/api/media-library?type=${typeFilter}`;
    fetch(apiUrl)
      .then((r) => (r.ok ? r.json() : []))
      .then(setItems)
      .finally(() => setLoading(false));
  }, [session, typeFilter]);

  async function addMedia() {
    if (!url.trim() || !filename.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/media-library", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filename: filename.trim(), url: url.trim(), type: mediaType, altText: altText || undefined }),
    });
    if (res.ok) {
      const item = await res.json();
      setItems((prev) => [item, ...prev]);
      setUrl("");
      setFilename("");
      setAltText("");
      setShowUpload(false);
      toast("Media added!", "success");
    }
    setSubmitting(false);
  }

  async function deleteMedia(id: string) {
    const res = await fetch(`/api/media-library?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast("Deleted", "success");
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Media", href: "/media-library" }} />
        <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
          <p className="text-sm text-medium-gray">Please log in to manage your media.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Media", href: "/media-library" }} />

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Media Library</h1>
            <p className="text-sm text-medium-gray">{items.length} item{items.length !== 1 ? "s" : ""}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex border border-medium-gray/30">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-2 py-1 text-xs ${viewMode === "grid" ? "bg-code-green text-black" : "text-medium-gray"}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-2 py-1 text-xs ${viewMode === "list" ? "bg-code-green text-black" : "text-medium-gray"}`}
              >
                List
              </button>
            </div>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="px-4 py-1.5 text-xs font-semibold border border-code-green bg-code-green text-black hover:bg-transparent hover:text-code-green transition-colors"
            >
              {showUpload ? "Cancel" : "Add Media"}
            </button>
          </div>
        </div>

        {/* Type filter */}
        <div className="flex gap-1 mb-6">
          {typeFilters.map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 text-xs font-semibold transition-colors ${
                typeFilter === t ? "bg-code-green text-black" : "border border-medium-gray/30 text-medium-gray hover:text-light-gray"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {showUpload && (
          <div className="border border-medium-gray/20 p-4 mb-6 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// add media"}
            </h2>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="URL of the media file"
              className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="Filename"
                className="border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
              />
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value)}
                className="border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="document">Document</option>
                <option value="audio">Audio</option>
              </select>
            </div>
            <input
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Alt text (optional)"
              className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
            />
            <button
              onClick={addMedia}
              disabled={submitting || !url.trim() || !filename.trim()}
              className="px-4 py-2 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors disabled:opacity-50"
            >
              {submitting ? "Adding..." : "Add Media"}
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-medium-gray">Loading...</p>
        ) : items.length === 0 ? (
          <div className="border border-medium-gray/20 p-8 text-center">
            <p className="text-sm text-medium-gray">No media items yet.</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {items.map((item) => (
              <div key={item.id} className="border border-medium-gray/20 group hover:border-code-green/30 transition-colors">
                <div className="aspect-square bg-medium-gray/10 flex items-center justify-center overflow-hidden">
                  {item.type === "image" ? (
                    <img src={item.url} alt={item.alt_text || item.filename} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl text-medium-gray">
                      {item.type === "video" ? "▶" : item.type === "audio" ? "♪" : "◆"}
                    </span>
                  )}
                </div>
                <div className="p-2">
                  <p className="text-xs text-light-gray truncate">{item.filename}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-medium-gray">{formatFileSize(item.size_bytes)}</span>
                    <button
                      onClick={() => deleteMedia(item.id)}
                      className="text-xs text-medium-gray hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-medium-gray/20 divide-y divide-medium-gray/10">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 p-3 group hover:bg-medium-gray/5 transition-colors">
                <div className="w-10 h-10 bg-medium-gray/10 flex items-center justify-center shrink-0">
                  {item.type === "image" ? (
                    <img src={item.url} alt={item.alt_text || item.filename} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm text-medium-gray">
                      {item.type === "video" ? "▶" : item.type === "audio" ? "♪" : "◆"}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-light-gray truncate">{item.filename}</p>
                  <p className="text-xs text-medium-gray">{item.type} · {formatFileSize(item.size_bytes)} · {formatTimeAgo(item.created_at)}</p>
                </div>
                <button
                  onClick={() => deleteMedia(item.id)}
                  className="text-xs text-medium-gray hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
