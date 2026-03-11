"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/toast";
import { MarkdownText } from "@/components/markdown-text";
import { formatTimeAgo } from "@/lib/time";

type WikiPage = {
  id: string;
  title: string;
  content: string;
  slug: string;
  parent_id: string | null;
  author_name: string;
  editor_name: string | null;
  created_at: string;
  updated_at: string;
};

export function WikiViewer({
  endeavorId,
  canEdit = false,
}: {
  endeavorId: string;
  canEdit?: boolean;
}) {
  const { toast } = useToast();
  const [pages, setPages] = useState<WikiPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<WikiPage | null>(null);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/wiki`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: WikiPage[]) => {
        setPages(data);
        if (data.length > 0 && !selectedPage) {
          setSelectedPage(data[0]);
        }
      })
      .finally(() => setLoading(false));
  }, [endeavorId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function savePage() {
    setSaving(true);
    if (creating) {
      const res = await fetch(`/api/endeavors/${endeavorId}/wiki`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle.trim(), content: editContent.trim() }),
      });
      if (res.ok) {
        const page = await res.json();
        const newPage = { ...page, author_name: "You", editor_name: null };
        setPages((prev) => [...prev, newPage]);
        setSelectedPage(newPage);
        setEditing(false);
        setCreating(false);
        toast("Page created", "success");
      }
    } else if (selectedPage) {
      const res = await fetch(`/api/endeavors/${endeavorId}/wiki`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId: selectedPage.id, title: editTitle.trim(), content: editContent.trim() }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPages((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
        setSelectedPage({ ...selectedPage, ...updated });
        setEditing(false);
        toast("Page updated", "success");
      }
    }
    setSaving(false);
  }

  async function deletePage(pageId: string) {
    const res = await fetch(`/api/endeavors/${endeavorId}/wiki`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pageId }),
    });
    if (res.ok) {
      setPages((prev) => prev.filter((p) => p.id !== pageId));
      if (selectedPage?.id === pageId) {
        setSelectedPage(pages.find((p) => p.id !== pageId) || null);
      }
      toast("Page deleted");
    }
  }

  if (loading) return null;
  if (pages.length === 0 && !canEdit) return null;

  const rootPages = pages.filter((p) => !p.parent_id);

  return (
    <div className="border border-medium-gray/20">
      <div className="flex items-center justify-between p-3 border-b border-medium-gray/10">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// wiki"}
        </h3>
        {canEdit && (
          <button
            onClick={() => {
              setCreating(true);
              setEditing(true);
              setEditTitle("");
              setEditContent("");
              setSelectedPage(null);
            }}
            className="text-xs text-code-blue hover:text-code-green transition-colors"
          >
            + New Page
          </button>
        )}
      </div>

      <div className="flex min-h-[200px]">
        {/* Sidebar */}
        <div className="w-48 shrink-0 border-r border-medium-gray/10 p-2">
          {rootPages.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPage(p);
                setEditing(false);
                setCreating(false);
              }}
              className={`w-full text-left px-2 py-1.5 text-xs truncate transition-colors ${
                selectedPage?.id === p.id
                  ? "text-code-green bg-code-green/10"
                  : "text-light-gray hover:text-white"
              }`}
            >
              {p.title}
            </button>
          ))}
          {pages.length === 0 && (
            <p className="text-xs text-medium-gray p-2">No pages yet</p>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          {editing ? (
            <div className="space-y-3">
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Page title"
                className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
              />
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Write your content (Markdown supported)..."
                rows={10}
                className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray resize-y font-mono"
              />
              <div className="flex gap-2">
                <button
                  onClick={savePage}
                  disabled={saving || !editTitle.trim() || !editContent.trim()}
                  className="px-3 py-1.5 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : creating ? "Create" : "Save"}
                </button>
                <button
                  onClick={() => {
                    setEditing(false);
                    setCreating(false);
                  }}
                  className="px-3 py-1.5 text-xs text-medium-gray hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : selectedPage ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">{selectedPage.title}</h2>
                {canEdit && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditing(true);
                        setEditTitle(selectedPage.title);
                        setEditContent(selectedPage.content);
                      }}
                      className="text-xs text-code-blue hover:text-code-green transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deletePage(selectedPage.id)}
                      className="text-xs text-medium-gray hover:text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
              <div className="text-sm text-light-gray leading-relaxed">
                <MarkdownText content={selectedPage.content} />
              </div>
              <div className="mt-4 pt-3 border-t border-medium-gray/10 flex items-center gap-3 text-xs text-medium-gray">
                <span>by {selectedPage.author_name}</span>
                {selectedPage.editor_name && (
                  <span>edited by {selectedPage.editor_name}</span>
                )}
                <span>{formatTimeAgo(selectedPage.updated_at)}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-medium-gray">
              {canEdit ? "Create a page to get started." : "Select a page from the sidebar."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
