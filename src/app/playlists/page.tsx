"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

type Playlist = {
  id: string;
  creator_id: string;
  creator_name: string;
  creator_image: string | null;
  title: string;
  description: string | null;
  category: string | null;
  visibility: string;
  item_count: number;
  follower_count: number;
  created_at: string;
};

const CATEGORIES = [
  "All",
  "Programming",
  "Design",
  "Business",
  "Science",
  "Art",
  "Music",
  "Writing",
  "Health",
  "Other",
];

export default function PlaylistsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params =
      activeCategory !== "All"
        ? `?category=${encodeURIComponent(activeCategory)}`
        : "";
    setLoading(true);
    fetch(`/api/playlists${params}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setPlaylists)
      .finally(() => setLoading(false));
  }, [activeCategory]);

  async function handleCreate() {
    if (!title.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/playlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: description.trim() || null,
        category: category || null,
        visibility,
      }),
    });
    if (res.ok) {
      const pl = await res.json();
      setPlaylists((prev) => [pl, ...prev]);
      setTitle("");
      setDescription("");
      setCategory("");
      setVisibility("public");
      setShowCreate(false);
      toast("Playlist created!", "success");
    } else {
      const err = await res.json();
      toast(err.error || "Failed to create", "error");
    }
    setSubmitting(false);
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Playlists", href: "/playlists" }} />

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="mb-2 text-2xl font-bold">Learning Playlists</h1>
            <p className="text-sm text-medium-gray">
              Curated collections of resources, tutorials, and guides
            </p>
          </div>
          {session && (
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="shrink-0 border border-code-green px-4 py-2 text-sm font-semibold text-code-green transition-colors hover:bg-code-green/10"
            >
              {showCreate ? "Cancel" : "+ New Playlist"}
            </button>
          )}
        </div>

        {/* Create Form */}
        {showCreate && (
          <div className="mb-8 border border-medium-gray/20 p-5">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// create playlist"}
            </h3>
            <div className="mb-3">
              <label className="mb-1 block text-xs text-medium-gray">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Intro to Machine Learning"
                className="w-full border border-medium-gray/30 bg-transparent px-3 py-2 text-sm text-white placeholder:text-medium-gray/50 focus:border-code-green focus:outline-none"
              />
            </div>
            <div className="mb-3">
              <label className="mb-1 block text-xs text-medium-gray">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What will people learn from this playlist?"
                rows={3}
                className="w-full resize-none border border-medium-gray/30 bg-transparent px-3 py-2 text-sm text-white placeholder:text-medium-gray/50 focus:border-code-green focus:outline-none"
              />
            </div>
            <div className="mb-3 flex gap-4">
              <div className="flex-1">
                <label className="mb-1 block text-xs text-medium-gray">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white focus:border-code-green focus:outline-none"
                >
                  <option value="">Select category...</option>
                  {CATEGORIES.filter((c) => c !== "All").map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label className="mb-1 block text-xs text-medium-gray">
                  Visibility
                </label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white focus:border-code-green focus:outline-none"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
            </div>
            <button
              onClick={handleCreate}
              disabled={submitting || !title.trim()}
              className="border border-code-green bg-code-green/10 px-4 py-1.5 text-xs font-semibold text-code-green transition-colors hover:bg-code-green/20 disabled:opacity-40"
            >
              {submitting ? "Creating..." : "Create Playlist"}
            </button>
          </div>
        )}

        {/* Category Filter */}
        <div className="mb-6 flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`border px-3 py-1 text-xs transition-colors ${
                activeCategory === cat
                  ? "border-code-green bg-code-green/10 text-code-green"
                  : "border-medium-gray/30 text-medium-gray hover:border-medium-gray/50 hover:text-light-gray"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Playlist List */}
        {loading ? (
          <div className="py-12 text-center text-sm text-medium-gray">
            Loading playlists...
          </div>
        ) : playlists.length === 0 ? (
          <div className="border border-medium-gray/20 p-12 text-center">
            <p className="mb-2 text-medium-gray">No playlists found</p>
            <p className="text-sm text-medium-gray/60">
              {activeCategory !== "All"
                ? `No playlists in the "${activeCategory}" category yet`
                : "Be the first to create a learning playlist"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {playlists.map((pl) => (
              <div
                key={pl.id}
                className="group border border-medium-gray/20 p-5 transition-colors hover:border-code-green/50"
              >
                <div className="mb-2 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold transition-colors group-hover:text-code-green">
                      {pl.title}
                    </h2>
                    {pl.description && (
                      <p className="mt-1 text-sm leading-relaxed text-medium-gray line-clamp-2">
                        {pl.description}
                      </p>
                    )}
                  </div>
                  {pl.category && (
                    <span className="shrink-0 border border-code-blue/30 px-2 py-0.5 text-xs text-code-blue">
                      {pl.category}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-medium-gray">
                  <span>by {pl.creator_name}</span>
                  <span>&middot;</span>
                  <span>
                    {pl.item_count} {pl.item_count === 1 ? "item" : "items"}
                  </span>
                  <span>&middot;</span>
                  <span>
                    {pl.follower_count}{" "}
                    {pl.follower_count === 1 ? "follower" : "followers"}
                  </span>
                  <span>&middot;</span>
                  <span>{formatTimeAgo(pl.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
