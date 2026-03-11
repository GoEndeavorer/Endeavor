"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

type Collection = {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  itemCount: number;
  createdAt: string;
};

export default function CollectionsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newIsPublic, setNewIsPublic] = useState(false);
  const [creating, setCreating] = useState(false);

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
      }
    } finally {
      setCreating(false);
    }
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
          <button
            onClick={() => setShowCreate(true)}
            className="border border-code-green px-4 py-2 text-sm text-code-green transition-colors hover:bg-code-green hover:text-black"
          >
            + New Collection
          </button>
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

        {/* Collections grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-36 animate-pulse border border-medium-gray/20 bg-medium-gray/5" />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="py-20 text-center text-medium-gray">
            <p className="text-lg">No collections yet</p>
            <p className="mt-2 text-sm">
              Create a collection to organize your bookmarked endeavors.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collections.map((c) => (
              <Link
                key={c.id}
                href={`/collections/${c.id}`}
                className="group flex flex-col border border-medium-gray/30 p-5 transition-colors hover:border-code-green/50"
              >
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
                  <span>
                    {c.itemCount} {c.itemCount === 1 ? "item" : "items"}
                  </span>
                  <span>{new Date(c.createdAt).toLocaleDateString()}</span>
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
