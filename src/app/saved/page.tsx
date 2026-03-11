"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";

type SavedEndeavor = {
  id: string;
  endeavorId: string;
  title: string;
  category: string;
  status: string;
  imageUrl: string | null;
  description: string;
  memberCount: number;
  createdAt: string;
};

const statusColors: Record<string, string> = {
  open: "text-code-green",
  "in-progress": "text-code-blue",
  completed: "text-purple-400",
  cancelled: "text-red-400",
  draft: "text-medium-gray",
};

export default function SavedPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [bookmarks, setBookmarks] = useState<SavedEndeavor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/bookmarks")
        .then((r) => (r.ok ? r.json() : []))
        .then(setBookmarks)
        .finally(() => setLoading(false));
    }
  }, [session]);

  async function removeBookmark(endeavorId: string) {
    await fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endeavorId }),
    });
    setBookmarks((prev) => prev.filter((b) => b.endeavorId !== endeavorId));
  }

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center text-medium-gray">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Saved", href: "/saved" }} />

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <h1 className="mb-6 text-3xl font-bold">Saved Endeavors</h1>

        {loading ? (
          <div className="py-20 text-center text-medium-gray text-sm">
            Loading...
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="border border-medium-gray/30 p-12 text-center">
            <p className="mb-2 text-medium-gray">No saved endeavors yet.</p>
            <p className="mb-6 text-xs text-medium-gray">
              Bookmark endeavors you&apos;re interested in to find them here later.
            </p>
            <Link
              href="/feed"
              className="border border-code-green px-6 py-3 text-xs font-bold uppercase text-code-green transition-colors hover:bg-code-green hover:text-black"
            >
              Explore Endeavors
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((b) => (
              <div
                key={b.id}
                className="group flex items-center gap-4 border border-medium-gray/30 p-4 transition-colors hover:border-code-green/50"
              >
                {b.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={b.imageUrl}
                    alt=""
                    className="h-16 w-24 flex-shrink-0 object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-16 w-24 flex-shrink-0 items-center justify-center bg-code-green/5 text-2xl font-bold text-code-green/30">
                    {b.title.charAt(0)}
                  </div>
                )}
                <Link href={`/endeavors/${b.endeavorId}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold truncate">{b.title}</h3>
                    <span
                      className={`text-xs font-semibold ${statusColors[b.status] || "text-medium-gray"}`}
                    >
                      {b.status === "in-progress"
                        ? "In Progress"
                        : b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-xs text-medium-gray mt-0.5">
                    {b.category} &middot; {b.memberCount} members
                  </p>
                  <p className="text-sm text-light-gray mt-1 line-clamp-1">
                    {b.description}
                  </p>
                </Link>
                <button
                  onClick={() => removeBookmark(b.endeavorId)}
                  className="flex-shrink-0 text-xs text-medium-gray hover:text-red-400 transition-colors"
                  title="Remove bookmark"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
