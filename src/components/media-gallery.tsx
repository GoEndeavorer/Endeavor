"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/time";

type MediaItem = {
  id: string;
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number | null;
  caption: string | null;
  createdAt: string;
  uploadedById: string;
  uploadedByName: string;
};

export function MediaGallery({ endeavorId }: { endeavorId: string }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [url, setUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/media`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setItems)
      .catch(() => {});
  }, [endeavorId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || !fileName.trim()) return;
    setSubmitting(true);

    const fileType = url.match(/\.(png|jpg|jpeg|gif|webp)$/i)
      ? `image/${url.split(".").pop()?.toLowerCase()}`
      : url.match(/\.pdf$/i)
      ? "application/pdf"
      : "application/octet-stream";

    const res = await fetch(`/api/endeavors/${endeavorId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url.trim(), fileName: fileName.trim(), fileType, caption: caption.trim() || null }),
    });

    if (res.ok) {
      const item = await res.json();
      setItems((prev) => [item, ...prev]);
      setUrl("");
      setFileName("");
      setCaption("");
      setShowForm(false);
    }
    setSubmitting(false);
  }

  const images = items.filter((i) => i.fileType.startsWith("image/"));
  const files = items.filter((i) => !i.fileType.startsWith("image/"));

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// media"} {items.length > 0 && `(${items.length})`}
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs text-medium-gray hover:text-code-green"
        >
          {showForm ? "Cancel" : "+ Add"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-4 border border-medium-gray/20 p-3 space-y-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URL (image or file link)"
            className="w-full border border-medium-gray/30 bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-code-green"
            required
          />
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            placeholder="File name"
            className="w-full border border-medium-gray/30 bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-code-green"
            required
          />
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Caption (optional)"
            className="w-full border border-medium-gray/30 bg-transparent px-3 py-2 text-sm text-white outline-none focus:border-code-green"
          />
          <button
            type="submit"
            disabled={submitting}
            className="border border-code-green px-4 py-1.5 text-xs font-bold text-code-green hover:bg-code-green hover:text-black disabled:opacity-50"
          >
            {submitting ? "..." : "Add Media"}
          </button>
        </form>
      )}

      {/* Image grid */}
      {images.length > 0 && (
        <div className="mb-4 grid grid-cols-3 gap-2">
          {images.map((img) => (
            <a
              key={img.id}
              href={img.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden border border-medium-gray/20 hover:border-code-green/50 transition-colors"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.caption || img.fileName} className="h-full w-full object-cover" />
              {img.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-black/70 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[10px] text-white truncate">{img.caption}</p>
                </div>
              )}
            </a>
          ))}
        </div>
      )}

      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-1">
          {files.map((f) => (
            <a
              key={f.id}
              href={f.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between border border-medium-gray/20 p-2 text-xs transition-colors hover:border-code-green/50"
            >
              <span className="truncate text-code-blue">{f.fileName}</span>
              <span className="shrink-0 text-[10px] text-medium-gray">
                {formatTimeAgo(f.createdAt)}
              </span>
            </a>
          ))}
        </div>
      )}

      {items.length === 0 && !showForm && (
        <p className="text-xs text-medium-gray">No media uploaded yet.</p>
      )}
    </div>
  );
}
