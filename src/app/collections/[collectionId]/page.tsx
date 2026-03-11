"use client";

import { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

type CollectionItem = {
  id: string;
  endeavorId: string;
  note: string | null;
  createdAt: string;
  title: string;
  category: string;
  imageUrl: string | null;
  status: string;
  description: string;
};

type CollectionDetail = {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
  createdAt: string;
  userId: string;
  items: CollectionItem[];
  isOwner: boolean;
};

const categoryColors: Record<string, string> = {
  Scientific: "border-code-blue text-code-blue",
  Tech: "border-purple-400 text-purple-400",
  Creative: "border-yellow-400 text-yellow-400",
  Adventure: "border-code-green text-code-green",
  Cultural: "border-orange-400 text-orange-400",
  Community: "border-pink-400 text-pink-400",
};

export default function CollectionDetailPage({
  params,
}: {
  params: Promise<{ collectionId: string }>;
}) {
  const { collectionId } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [collection, setCollection] = useState<CollectionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchCollection = useCallback(async () => {
    try {
      const res = await fetch(`/api/collections/${collectionId}`);
      if (res.ok) {
        const data = await res.json();
        setCollection(data);
        setEditName(data.name);
        setEditDescription(data.description || "");
        setEditIsPublic(data.isPublic);
      } else {
        router.push("/collections");
      }
    } finally {
      setLoading(false);
    }
  }, [collectionId, router]);

  useEffect(() => {
    fetchCollection();
  }, [fetchCollection]);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/collections/${collectionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          description: editDescription.trim() || null,
          isPublic: editIsPublic,
        }),
      });
      if (res.ok) {
        setEditing(false);
        fetchCollection();
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this collection? This cannot be undone.")) return;
    await fetch(`/api/collections/${collectionId}`, { method: "DELETE" });
    router.push("/collections");
  }

  async function handleRemoveItem(itemId: string) {
    const res = await fetch(`/api/collections/${collectionId}/items`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId }),
    });
    if (res.ok) fetchCollection();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-black text-white">
        <AppHeader breadcrumb={{ label: "Collections", href: "/collections" }} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-medium-gray/10" />
            <div className="h-4 w-96 bg-medium-gray/10" />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-medium-gray/5 border border-medium-gray/20" />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!collection) return null;

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <AppHeader breadcrumb={{ label: "Collections", href: "/collections" }} />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10">
        {/* Collection header */}
        <div className="mb-8">
          {editing ? (
            <div className="space-y-4 border border-medium-gray/30 p-5">
              <div>
                <label className="mb-1 block text-xs uppercase tracking-widest text-medium-gray">
                  Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-medium-gray/30 bg-transparent px-3 py-2 text-sm text-white focus:border-code-green focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs uppercase tracking-widest text-medium-gray">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full border border-medium-gray/30 bg-transparent px-3 py-2 text-sm text-white focus:border-code-green focus:outline-none"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={editIsPublic}
                  onChange={(e) => setEditIsPublic(e.target.checked)}
                  className="accent-code-green"
                />
                <span className="text-medium-gray">Public</span>
              </label>
              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving || !editName.trim()}
                  className="border border-code-green px-4 py-2 text-sm text-code-green hover:bg-code-green hover:text-black disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 text-sm text-medium-gray hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight">
                    <span className="text-code-green">{"// "}</span>
                    {collection.name}
                  </h1>
                  <span
                    className={`border px-2 py-0.5 text-xs uppercase ${
                      collection.isPublic
                        ? "border-code-blue text-code-blue"
                        : "border-medium-gray/50 text-medium-gray"
                    }`}
                  >
                    {collection.isPublic ? "Public" : "Private"}
                  </span>
                </div>
                {collection.description && (
                  <p className="mt-2 text-sm text-medium-gray">
                    {collection.description}
                  </p>
                )}
                <p className="mt-1 text-xs text-medium-gray/60">
                  {collection.items.length}{" "}
                  {collection.items.length === 1 ? "item" : "items"} &middot;
                  Created {new Date(collection.createdAt).toLocaleDateString()}
                </p>
              </div>
              {collection.isOwner && (
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => setEditing(true)}
                    className="border border-medium-gray/30 px-3 py-1.5 text-xs text-medium-gray hover:border-code-green hover:text-code-green"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="border border-medium-gray/30 px-3 py-1.5 text-xs text-medium-gray hover:border-red-500 hover:text-red-500"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Items grid */}
        {collection.items.length === 0 ? (
          <div className="py-20 text-center text-medium-gray">
            <p className="text-lg">No items in this collection</p>
            <p className="mt-2 text-sm">
              Browse endeavors and add them to this collection.
            </p>
            <Link
              href="/feed"
              className="mt-4 inline-block border border-code-green px-4 py-2 text-sm text-code-green hover:bg-code-green hover:text-black"
            >
              Explore Endeavors
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {collection.items.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col border border-medium-gray/30 transition-colors hover:border-code-green/50 overflow-hidden"
              >
                <Link href={`/endeavors/${item.endeavorId}`} className="flex flex-col flex-1">
                  {item.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="h-36 w-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="flex flex-col flex-1 p-5">
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className={`border px-2 py-0.5 text-xs uppercase ${
                          categoryColors[item.category] ||
                          "border-medium-gray text-medium-gray"
                        }`}
                      >
                        {item.category}
                      </span>
                      <span className="text-xs uppercase text-medium-gray/60">
                        {item.status}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white group-hover:text-code-green transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-medium-gray line-clamp-2">
                      {item.description}
                    </p>
                    {item.note && (
                      <p className="mt-2 border-l-2 border-code-green/30 pl-2 text-xs text-code-green/70 italic">
                        {item.note}
                      </p>
                    )}
                  </div>
                </Link>
                {collection.isOwner && (
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="absolute top-2 right-2 bg-black/70 border border-medium-gray/30 px-2 py-1 text-xs text-medium-gray opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500 hover:border-red-500"
                    title="Remove from collection"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Back link */}
        <div className="mt-10">
          <Link
            href="/collections"
            className="text-sm text-medium-gray hover:text-code-green"
          >
            &larr; Back to Collections
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
