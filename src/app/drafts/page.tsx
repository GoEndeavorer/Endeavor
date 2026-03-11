"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";

type DraftEndeavor = {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export default function DraftsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { toast } = useToast();
  const [drafts, setDrafts] = useState<DraftEndeavor[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/drafts")
        .then((r) => (r.ok ? r.json() : []))
        .then(setDrafts)
        .finally(() => setLoading(false));
    }
  }, [session]);

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Delete this draft? This action cannot be undone."
    );
    if (!confirmed) return;

    setDeletingId(id);
    try {
      const res = await fetch("/api/drafts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        setDrafts((prev) => prev.filter((d) => d.id !== id));
        toast("Draft deleted", "success");
      } else {
        toast("Failed to delete draft", "error");
      }
    } catch {
      toast("Failed to delete draft", "error");
    } finally {
      setDeletingId(null);
    }
  }

  async function handlePublish(id: string) {
    setPublishingId(id);
    try {
      const res = await fetch(`/api/endeavors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "open" }),
      });

      if (res.ok) {
        setDrafts((prev) => prev.filter((d) => d.id !== id));
        toast("Endeavor published", "success");
      } else {
        toast("Failed to publish endeavor", "error");
      }
    } catch {
      toast("Failed to publish endeavor", "error");
    } finally {
      setPublishingId(null);
    }
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
      <AppHeader breadcrumb={{ label: "Drafts", href: "/drafts" }} />

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-code-green mb-2 font-mono">
            {"// draft endeavors"}
          </p>
          <h1 className="text-2xl font-bold mb-1">Drafts</h1>
          <p className="text-sm text-medium-gray">
            Unpublished endeavors. Edit, publish, or discard.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse border border-medium-gray/20 p-4"
              >
                <div className="space-y-2">
                  <div className="h-4 w-2/3 bg-medium-gray/10" />
                  <div className="h-3 w-1/3 bg-medium-gray/10" />
                </div>
              </div>
            ))}
          </div>
        ) : drafts.length === 0 ? (
          <div className="border border-medium-gray/30 p-12 text-center">
            <div className="text-4xl mb-4 text-medium-gray/40">{"{ }"}</div>
            <p className="mb-2 text-medium-gray">
              No drafts. Create a new endeavor to get started.
            </p>
            <Link
              href="/endeavors/create"
              className="mt-2 inline-block border border-code-green px-6 py-3 text-xs font-bold uppercase text-code-green transition-colors hover:bg-code-green hover:text-black"
            >
              New Endeavor
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {drafts.map((d) => (
              <div
                key={d.id}
                className="group border border-medium-gray/20 p-4 transition-colors hover:border-code-green/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate">{d.title}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-medium-gray font-mono">
                      <span className="text-xs">{d.category}</span>
                      <span className="text-medium-gray/40">&middot;</span>
                      <span className="text-xs">
                        updated {formatTimeAgo(d.updatedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/endeavors/${d.id}/edit`}
                      className="border border-medium-gray/30 px-3 py-1 text-xs font-mono text-medium-gray transition-colors hover:border-code-green/50 hover:text-code-green"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handlePublish(d.id)}
                      disabled={publishingId === d.id}
                      className="border border-code-green/50 px-3 py-1 text-xs font-mono text-code-green transition-colors hover:bg-code-green hover:text-black disabled:opacity-50"
                    >
                      {publishingId === d.id ? "Publishing..." : "Publish"}
                    </button>
                    <button
                      onClick={() => handleDelete(d.id)}
                      disabled={deletingId === d.id}
                      className="border border-medium-gray/30 px-3 py-1 text-xs font-mono text-medium-gray transition-colors hover:border-red-500/50 hover:text-red-400 disabled:opacity-50"
                    >
                      {deletingId === d.id ? "..." : "Delete"}
                    </button>
                  </div>
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
