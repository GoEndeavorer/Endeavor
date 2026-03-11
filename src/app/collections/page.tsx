"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";

type Collection = {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  itemCount: number;
  createdAt: string;
  previewThumbnails: string[];
  previewTitles: string[];
};

type ViewMode = "grid" | "list";

export default function CollectionsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newIsPublic, setNewIsPublic] = useState(false);
  const [creating, setCreating] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const fetchCollections = useCallback(async () => {
    try {
      const res = await fetch("/api/collections");
      if (res.ok) {
        setCollections(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchCollections();
  }, [session, fetchCollections]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDescription.trim() || null,
          isPublic: newIsPublic,
        }),
      });
      if (res.ok) {
        setNewName("");
        setNewDescription("");
        setNewIsPublic(false);
        setShowCreate(false);
        fetchCollections();
        toast("Collection created", "success");
      }
    } finally {
      setCreating(false);
    }
  }

  function handleShare(e: React.MouseEvent, collection: Collection) {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/collections/${collection.id}`;
    navigator.clipboard.writeText(url).then(() => {
      toast("Link copied to clipboard", "success");
    });
  }

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-medium-gray">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <AppHeader breadcrumb={{ label: "Collections", href: "/collections" }} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="text-code-green">{"// "}</span>Collections
            </h1>
            <p className="mt-1 text-sm text-medium-gray">
              Organize your bookmarked endeavors into collections
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex border border-medium-gray/30">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 text-xs transition-colors ${
                  viewMode === "grid"
                    ? "bg-code-green/10 text-code-green"
                    : "text-medium-gray hover:text-white"
                }`}
                title="Grid view"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="1" y="1" width="5.5" height="5.5" rx="0.5" />
                  <rect x="9.5" y="1" width="5.5" height="5.5" rx="0.5" />
                  <rect x="1" y="9.5" width="5.5" height="5.5" rx="0.5" />
                  <rect x="9.5" y="9.5" width="5.5" height="5.5" rx="0.5" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-2 text-xs transition-colors ${
                  viewMode === "list"
                    ? "bg-code-green/10 text-code-green"
                    : "text-medium-gray hover:text-white"
                }`}
                title="List view"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <line x1="1" y1="3" x2="15" y2="3" />
                  <line x1="1" y1="8" x2="15" y2="8" />
                  <line x1="1" y1="13" x2="15" y2="13" />
                </svg>
              </button>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="border border-code-green px-4 py-2 text-sm text-code-green transition-colors hover:bg-code-green hover:text-black"
            >
              + New Collection
            </button>
          </div>
        </div>

        {/* Create modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
            <form
              onSubmit={handleCreate}
              className="w-full max-w-md border border-medium-gray/30 bg-black p-6"
            >
              <h2 className="mb-4 text-lg font-semibold">
                <span className="text-code-green">{"// "}</span>New Collection
              </h2>

              <label className="mb-1 block text-xs uppercase tracking-widest text-medium-gray">
                Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Weekend Projects"
                className="mb-4 w-full border border-medium-gray/30 bg-transparent px-3 py-2 text-sm text-white placeholder-medium-gray/50 focus:border-code-green focus:outline-none"
                autoFocus
              />

              <label className="mb-1 block text-xs uppercase tracking-widest text-medium-gray">
                Description (optional)
              </label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={2}
                className="mb-4 w-full border border-medium-gray/30 bg-transparent px-3 py-2 text-sm text-white placeholder-medium-gray/50 focus:border-code-green focus:outline-none"
              />

              <label className="mb-4 flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={newIsPublic}
                  onChange={(e) => setNewIsPublic(e.target.checked)}
                  className="accent-code-green"
                />
                <span className="text-medium-gray">Make this collection public</span>
              </label>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 text-sm text-medium-gray hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newName.trim()}
                  className="border border-code-green px-4 py-2 text-sm text-code-green transition-colors hover:bg-code-green hover:text-black disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Collections */}
        {loading ? (
          <div
            className={
              viewMode === "grid"
                ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                : "flex flex-col gap-3"
            }
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`animate-pulse border border-medium-gray/20 bg-medium-gray/5 ${
                  viewMode === "grid" ? "h-48" : "h-24"
                }`}
              />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="py-20 text-center text-medium-gray">
            <p className="text-lg">No collections yet</p>
            <p className="mt-2 text-sm">
              Create a collection to organize your bookmarked endeavors.
            </p>
          </div>
        ) : viewMode === "grid" ? (
          /* ── Grid View ─────────────────────────────── */
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((c) => (
              <Link
                key={c.id}
                href={`/collections/${c.id}`}
                className="group flex flex-col border border-medium-gray/30 p-5 transition-colors hover:border-code-green/50"
              >
                {/* Thumbnails preview */}
                <div className="mb-3 flex gap-1.5">
                  {c.previewThumbnails.length > 0 ? (
                    c.previewThumbnails.map((thumb, i) => (
                      <div
                        key={i}
                        className="relative h-14 w-14 shrink-0 overflow-hidden border border-medium-gray/20 bg-medium-gray/10"
                      >
                        <Image
                          src={thumb}
                          alt={c.previewTitles[i] || "Endeavor thumbnail"}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="flex h-14 w-full items-center justify-center border border-dashed border-medium-gray/20 text-xs text-medium-gray/40">
                      No endeavors yet
                    </div>
                  )}
                  {c.itemCount > 3 && c.previewThumbnails.length === 3 && (
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center border border-medium-gray/20 bg-medium-gray/5 text-xs text-medium-gray">
                      +{c.itemCount - 3}
                    </div>
                  )}
                </div>

                <div className="mb-2 flex items-center justify-between">
                  <h3 className="font-semibold text-white group-hover:text-code-green transition-colors truncate">
                    {c.name}
                  </h3>
                  <span
                    className={`ml-2 shrink-0 border px-2 py-0.5 text-xs uppercase ${
                      c.isPublic
                        ? "border-code-blue text-code-blue"
                        : "border-medium-gray/50 text-medium-gray"
                    }`}
                  >
                    {c.isPublic ? "Public" : "Private"}
                  </span>
                </div>
                {c.description && (
                  <p className="mb-3 text-sm text-medium-gray line-clamp-2">
                    {c.description}
                  </p>
                )}
                <div className="mt-auto pt-3 border-t border-medium-gray/20 flex items-center justify-between text-xs text-medium-gray">
                  <span className="text-code-blue font-medium">
                    {c.itemCount} {c.itemCount === 1 ? "endeavor" : "endeavors"}
                  </span>
                  <div className="flex items-center gap-2">
                    {c.isPublic && (
                      <button
                        onClick={(e) => handleShare(e, c)}
                        className="text-medium-gray hover:text-code-green transition-colors"
                        title="Copy share link"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M4.5 9.5L11.5 6M4.5 6.5L11.5 10" />
                          <circle cx="3" cy="8" r="2" />
                          <circle cx="13" cy="5" r="2" />
                          <circle cx="13" cy="11" r="2" />
                        </svg>
                      </button>
                    )}
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          /* ── List View ─────────────────────────────── */
          <div className="flex flex-col gap-2">
            {/* List header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-code-green border-b border-medium-gray/20">
              <div className="col-span-1">{"// preview"}</div>
              <div className="col-span-4">{"// name"}</div>
              <div className="col-span-3">{"// description"}</div>
              <div className="col-span-1 text-center">{"// count"}</div>
              <div className="col-span-1 text-center">{"// status"}</div>
              <div className="col-span-2 text-right">{"// date"}</div>
            </div>
            {collections.map((c) => (
              <Link
                key={c.id}
                href={`/collections/${c.id}`}
                className="group grid grid-cols-12 items-center gap-4 border border-medium-gray/30 px-4 py-3 transition-colors hover:border-code-green/50"
              >
                {/* Thumbnails */}
                <div className="col-span-1 flex -space-x-2">
                  {c.previewThumbnails.length > 0 ? (
                    c.previewThumbnails.slice(0, 3).map((thumb, i) => (
                      <div
                        key={i}
                        className="relative h-8 w-8 shrink-0 overflow-hidden border border-medium-gray/20 bg-medium-gray/10"
                        style={{ zIndex: 3 - i }}
                      >
                        <Image
                          src={thumb}
                          alt={c.previewTitles[i] || "Endeavor thumbnail"}
                          fill
                          className="object-cover"
                          sizes="32px"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="h-8 w-8 border border-dashed border-medium-gray/20" />
                  )}
                </div>

                {/* Name */}
                <div className="col-span-4">
                  <h3 className="font-semibold text-white group-hover:text-code-green transition-colors truncate">
                    {c.name}
                  </h3>
                </div>

                {/* Description */}
                <div className="col-span-3">
                  <p className="text-sm text-medium-gray truncate">
                    {c.description || "-"}
                  </p>
                </div>

                {/* Count */}
                <div className="col-span-1 text-center">
                  <span className="text-sm font-medium text-code-blue">
                    {c.itemCount}
                  </span>
                </div>

                {/* Public / Private + share */}
                <div className="col-span-1 flex items-center justify-center gap-1.5">
                  <span
                    className={`border px-2 py-0.5 text-xs uppercase ${
                      c.isPublic
                        ? "border-code-blue text-code-blue"
                        : "border-medium-gray/50 text-medium-gray"
                    }`}
                  >
                    {c.isPublic ? "Pub" : "Prv"}
                  </span>
                  {c.isPublic && (
                    <button
                      onClick={(e) => handleShare(e, c)}
                      className="text-medium-gray hover:text-code-green transition-colors"
                      title="Copy share link"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M4.5 9.5L11.5 6M4.5 6.5L11.5 10" />
                        <circle cx="3" cy="8" r="2" />
                        <circle cx="13" cy="5" r="2" />
                        <circle cx="13" cy="11" r="2" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Date */}
                <div className="col-span-2 text-right text-xs text-medium-gray">
                  {new Date(c.createdAt).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
