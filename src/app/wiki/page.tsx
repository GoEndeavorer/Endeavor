"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";

type WikiPage = {
  id: string;
  slug: string;
  title: string;
  content: string;
  author_id: string;
  parent_slug: string | null;
  revision: number;
  created_at: string;
  updated_at: string;
  author_name: string;
  author_image: string | null;
};

type TreeNode = WikiPage & { children: TreeNode[] };

function buildTree(pages: WikiPage[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  for (const page of pages) {
    map.set(page.slug, { ...page, children: [] });
  }

  for (const page of pages) {
    const node = map.get(page.slug)!;
    if (page.parent_slug && map.has(page.parent_slug)) {
      map.get(page.parent_slug)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export default function WikiPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewingPage, setViewingPage] = useState<WikiPage | null>(null);
  const [editing, setEditing] = useState(false);

  // Create form state
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [parentSlug, setParentSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Edit state
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    fetch("/api/wiki")
      .then((r) => (r.ok ? r.json() : []))
      .then(setPages)
      .finally(() => setLoading(false));
  }, []);

  const tree = useMemo(() => buildTree(pages), [pages]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!slug.trim() || !title.trim() || !content.trim()) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/wiki", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: slug.trim().toLowerCase().replace(/\s+/g, "-"),
          title,
          content,
          parent_slug: parentSlug || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast(err.error || "Failed to create page", "error");
        return;
      }

      const created = await res.json();
      created.author_name = session?.user?.name || "You";
      created.author_image = session?.user?.image || null;
      setPages((prev) => [...prev, created]);
      setSlug("");
      setTitle("");
      setContent("");
      setParentSlug("");
      setShowForm(false);
      toast("Wiki page created");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleView(pageSlug: string) {
    const res = await fetch(`/api/wiki/${pageSlug}`);
    if (res.ok) {
      const page = await res.json();
      setViewingPage(page);
      setEditing(false);
    }
  }

  function startEdit() {
    if (!viewingPage) return;
    setEditTitle(viewingPage.title);
    setEditContent(viewingPage.content);
    setEditing(true);
  }

  async function handleSaveEdit() {
    if (!viewingPage) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/wiki/${viewingPage.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });

      if (!res.ok) {
        toast("Failed to update page", "error");
        return;
      }

      const updated = await res.json();
      updated.author_name = viewingPage.author_name;
      updated.author_image = viewingPage.author_image;
      setViewingPage(updated);
      setPages((prev) =>
        prev.map((p) => (p.slug === updated.slug ? { ...p, ...updated } : p))
      );
      setEditing(false);
      toast("Page updated (revision " + updated.revision + ")");
    } finally {
      setSubmitting(false);
    }
  }

  function renderTreeNode(node: TreeNode, depth: number = 0) {
    return (
      <div key={node.slug}>
        <button
          onClick={() => handleView(node.slug)}
          className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-code-green/5 transition-colors group"
          style={{ paddingLeft: `${12 + depth * 20}px` }}
        >
          <span className="text-xs text-medium-gray/50 font-mono">
            {node.children.length > 0 ? "+" : "-"}
          </span>
          <span className="text-sm text-code-blue group-hover:text-code-green transition-colors flex-1 truncate">
            {node.title}
          </span>
          <span className="text-[10px] text-medium-gray/50 shrink-0">
            v{node.revision}
          </span>
          <span className="text-[10px] text-medium-gray/40 shrink-0">
            {formatTimeAgo(new Date(node.updated_at))}
          </span>
        </button>
        {node.children.length > 0 && (
          <div className="border-l border-medium-gray/10 ml-6">
            {node.children.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  }

  // Viewing a single page
  if (viewingPage) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Wiki", href: "/wiki" }} />

        <main className="mx-auto max-w-2xl px-4 pt-24 pb-16">
          <button
            onClick={() => { setViewingPage(null); setEditing(false); }}
            className="text-xs text-medium-gray hover:text-code-blue transition-colors mb-4"
          >
            &larr; Back to wiki
          </button>

          {editing ? (
            <div className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green mb-3">
                {"// editing"}
              </h2>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-transparent border border-medium-gray/30 px-3 py-2 text-sm text-light-gray focus:border-code-green/50 focus:outline-none"
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={16}
                className="w-full bg-transparent border border-medium-gray/30 px-3 py-2 text-sm text-light-gray font-mono focus:border-code-green/50 focus:outline-none resize-none"
              />
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => setEditing(false)}
                  className="text-xs text-medium-gray hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={submitting}
                  className="border border-code-green/50 px-4 py-1.5 text-xs text-code-green hover:bg-code-green/10 transition-colors disabled:opacity-30"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-xl font-bold text-light-gray">
                    {viewingPage.title}
                  </h1>
                  <div className="mt-1 flex items-center gap-3 text-xs text-medium-gray">
                    <span>{viewingPage.author_name}</span>
                    <span>revision {viewingPage.revision}</span>
                    <span>
                      updated {formatTimeAgo(new Date(viewingPage.updated_at))}
                    </span>
                  </div>
                </div>
                {session && (
                  <button
                    onClick={startEdit}
                    className="text-xs text-code-blue hover:text-code-green transition-colors shrink-0"
                  >
                    Edit page
                  </button>
                )}
              </div>
              <div className="border border-medium-gray/20 p-4">
                <div className="text-sm text-light-gray whitespace-pre-wrap font-mono leading-relaxed">
                  {viewingPage.content}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 text-xs text-medium-gray/50">
                <span>slug: {viewingPage.slug}</span>
                {viewingPage.parent_slug && (
                  <span>
                    parent:{" "}
                    <button
                      onClick={() => handleView(viewingPage.parent_slug!)}
                      className="text-code-blue hover:text-code-green transition-colors"
                    >
                      {viewingPage.parent_slug}
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Wiki", href: "/wiki" }} />

      <main className="mx-auto max-w-2xl px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Wiki</h1>
            {pages.length > 0 && (
              <span className="text-xs text-medium-gray">
                {pages.length} page{pages.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          {session && (
            <button
              onClick={() => setShowForm(!showForm)}
              className={`text-xs transition-colors ${
                showForm
                  ? "text-red-400 hover:text-red-300"
                  : "text-code-green hover:text-white"
              }`}
            >
              {showForm ? "Cancel" : "+ New Page"}
            </button>
          )}
        </div>

        {/* Create form */}
        {showForm && session && (
          <form
            onSubmit={handleCreate}
            className="mb-8 border border-medium-gray/30 p-4 space-y-3"
          >
            <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green mb-3">
              {"// new page"}
            </h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Page title..."
                className="flex-1 bg-transparent border border-medium-gray/30 px-3 py-2 text-sm text-light-gray placeholder:text-medium-gray/50 focus:border-code-green/50 focus:outline-none"
              />
              <input
                type="text"
                value={slug}
                onChange={(e) =>
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, "-")
                  )
                }
                placeholder="url-slug"
                className="w-48 bg-transparent border border-medium-gray/30 px-3 py-2 text-sm text-light-gray font-mono placeholder:text-medium-gray/50 focus:border-code-green/50 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-medium-gray">Parent page:</label>
              <select
                value={parentSlug}
                onChange={(e) => setParentSlug(e.target.value)}
                className="bg-transparent border border-medium-gray/30 px-2 py-1 text-xs text-light-gray focus:border-code-green/50 focus:outline-none"
              >
                <option value="">None (root page)</option>
                {pages.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write page content..."
              rows={8}
              className="w-full bg-transparent border border-medium-gray/30 px-3 py-2 text-sm text-light-gray font-mono placeholder:text-medium-gray/50 focus:border-code-green/50 focus:outline-none resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={
                  submitting || !slug.trim() || !title.trim() || !content.trim()
                }
                className="border border-code-green/50 px-4 py-1.5 text-xs text-code-green hover:bg-code-green/10 transition-colors disabled:opacity-30"
              >
                {submitting ? "Creating..." : "Create Page"}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-3 py-2 animate-pulse"
              >
                <div className="h-3 w-3 bg-medium-gray/20" />
                <div
                  className="h-4 bg-medium-gray/20"
                  style={{ width: `${40 + (i % 3) * 20}%` }}
                />
              </div>
            ))}
          </div>
        ) : pages.length === 0 ? (
          <div className="border border-medium-gray/20 p-12 text-center">
            <p className="text-2xl text-medium-gray/30 mb-3 font-mono">#</p>
            <p className="text-medium-gray text-sm">
              No wiki pages yet. Create the first page to start building the
              knowledge base.
            </p>
          </div>
        ) : (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green mb-3">
              {"// pages"}
            </h2>
            <div className="border border-medium-gray/20">
              {tree.map((node) => renderTreeNode(node))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
