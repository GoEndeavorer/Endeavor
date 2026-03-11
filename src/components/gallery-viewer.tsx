"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";

type GalleryImage = {
  id: string;
  endeavor_id: string;
  uploaded_by: string;
  url: string;
  caption: string | null;
  display_order: number;
  uploader_name: string;
  uploader_image: string | null;
  created_at: string;
};

type GalleryViewerProps = {
  endeavorId: string;
};

export function GalleryViewer({ endeavorId }: GalleryViewerProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/gallery`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setImages)
      .finally(() => setLoading(false));
  }, [endeavorId]);

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
  }, []);

  const navigateLightbox = useCallback(
    (direction: number) => {
      if (lightboxIndex === null) return;
      const next = lightboxIndex + direction;
      if (next >= 0 && next < images.length) {
        setLightboxIndex(next);
      }
    },
    [lightboxIndex, images.length]
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") navigateLightbox(-1);
      if (e.key === "ArrowRight") navigateLightbox(1);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, closeLightbox, navigateLightbox]);

  async function handleUpload() {
    if (!url.trim()) return;
    setSubmitting(true);
    const res = await fetch(`/api/endeavors/${endeavorId}/gallery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url.trim(), caption: caption.trim() || null }),
    });
    if (res.ok) {
      const img = await res.json();
      setImages((prev) => [img, ...prev]);
      setUrl("");
      setCaption("");
      setShowUpload(false);
      toast("Image added to gallery", "success");
    } else {
      const err = await res.json();
      toast(err.error || "Failed to upload", "error");
    }
    setSubmitting(false);
  }

  async function handleDelete(imageId: string) {
    if (!confirm("Remove this image from the gallery?")) return;
    const res = await fetch(
      `/api/endeavors/${endeavorId}/gallery?imageId=${imageId}`,
      { method: "DELETE" }
    );
    if (res.ok) {
      setImages((prev) => prev.filter((i) => i.id !== imageId));
      if (lightboxIndex !== null) closeLightbox();
      toast("Image removed", "success");
    } else {
      toast("Failed to remove image", "error");
    }
  }

  if (loading) {
    return (
      <div className="py-8 text-center text-sm text-medium-gray">
        Loading gallery...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// gallery"}
        </h3>
        {session && (
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="border border-code-green/50 px-3 py-1 text-xs text-code-green transition-colors hover:bg-code-green/10"
          >
            {showUpload ? "Cancel" : "+ Add Image"}
          </button>
        )}
      </div>

      {/* Upload Form */}
      {showUpload && (
        <div className="mb-6 border border-medium-gray/20 p-4">
          <div className="mb-3">
            <label className="mb-1 block text-xs text-medium-gray">
              Image URL *
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full border border-medium-gray/30 bg-transparent px-3 py-2 text-sm text-white placeholder:text-medium-gray/50 focus:border-code-green focus:outline-none"
            />
          </div>
          <div className="mb-3">
            <label className="mb-1 block text-xs text-medium-gray">
              Caption
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Describe this image..."
              className="w-full border border-medium-gray/30 bg-transparent px-3 py-2 text-sm text-white placeholder:text-medium-gray/50 focus:border-code-green focus:outline-none"
            />
          </div>
          <button
            onClick={handleUpload}
            disabled={submitting || !url.trim()}
            className="border border-code-green bg-code-green/10 px-4 py-1.5 text-xs font-semibold text-code-green transition-colors hover:bg-code-green/20 disabled:opacity-40"
          >
            {submitting ? "Adding..." : "Add to Gallery"}
          </button>
        </div>
      )}

      {/* Image Grid */}
      {images.length === 0 ? (
        <div className="border border-medium-gray/20 p-12 text-center">
          <p className="mb-1 text-medium-gray">No images yet</p>
          <p className="text-xs text-medium-gray/60">
            Add images to showcase this endeavor
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img, index) => (
            <div
              key={img.id}
              className="group relative cursor-pointer overflow-hidden border border-medium-gray/20 transition-colors hover:border-code-green/50"
              onClick={() => openLightbox(index)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.caption || "Gallery image"}
                className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
              />
              {img.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-black/70 px-2 py-1.5 text-xs text-light-gray opacity-0 transition-opacity group-hover:opacity-100">
                  {img.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Overlay */}
      {lightboxIndex !== null && images[lightboxIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={closeLightbox}
        >
          <div
            className="relative mx-4 max-h-[90vh] max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute -top-10 right-0 text-2xl text-white/70 transition-colors hover:text-white"
            >
              &times;
            </button>

            {/* Navigation arrows */}
            {lightboxIndex > 0 && (
              <button
                onClick={() => navigateLightbox(-1)}
                className="absolute left-0 top-1/2 -translate-x-12 -translate-y-1/2 text-3xl text-white/70 transition-colors hover:text-white"
              >
                &#8249;
              </button>
            )}
            {lightboxIndex < images.length - 1 && (
              <button
                onClick={() => navigateLightbox(1)}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 text-3xl text-white/70 transition-colors hover:text-white"
              >
                &#8250;
              </button>
            )}

            {/* Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[lightboxIndex].url}
              alt={images[lightboxIndex].caption || "Gallery image"}
              className="max-h-[80vh] w-auto border border-medium-gray/30 object-contain"
            />

            {/* Caption and metadata bar */}
            <div className="mt-3 flex items-center justify-between text-sm">
              <div>
                {images[lightboxIndex].caption && (
                  <p className="mb-1 text-white">
                    {images[lightboxIndex].caption}
                  </p>
                )}
                <p className="text-xs text-medium-gray">
                  by {images[lightboxIndex].uploader_name} &middot;{" "}
                  {formatTimeAgo(images[lightboxIndex].created_at)}
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-medium-gray">
                  {lightboxIndex + 1} / {images.length}
                </span>
                {session?.user.id === images[lightboxIndex].uploaded_by && (
                  <button
                    onClick={() => handleDelete(images[lightboxIndex].id)}
                    className="text-red-400 transition-colors hover:text-red-300"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
