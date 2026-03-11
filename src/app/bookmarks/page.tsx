"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";

type Bookmark = {
  id: string;
  content_type: string;
  content_id: string;
  title: string;
  url: string;
  folder_id: string | null;
  created_at: string;
};

type Folder = {
  id: string;
  name: string;
  color: string;
  bookmark_count: number;
};

export default function BookmarksPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [showFolderForm, setShowFolderForm] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folderColor, setFolderColor] = useState("#00FF00");

  useEffect(() => {
    Promise.all([
      fetch("/api/bookmarks?folderId=" + (activeFolder || "")).then((r) => (r.ok ? r.json() : [])),
      fetch("/api/bookmarks/folders").then((r) => (r.ok ? r.json() : [])),
    ]).then(([bk, fl]) => {
      setBookmarks(bk);
      setFolders(fl);
      setLoading(false);
    });
  }, [activeFolder]);

  async function createFolder() {
    if (!folderName.trim()) return;
    const res = await fetch("/api/bookmarks/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: folderName.trim(), color: folderColor }),
    });
    if (res.ok) {
      const folder = await res.json();
      setFolders((prev) => [...prev, folder]);
      setFolderName("");
      setShowFolderForm(false);
      toast("Folder created!", "success");
    }
  }

  async function deleteBookmark(id: string) {
    await fetch(`/api/bookmarks?id=${id}`, { method: "DELETE" });
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
    toast("Bookmark removed", "success");
  }

  if (!session) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Bookmarks", href: "/bookmarks" }} />
        <main className="mx-auto max-w-4xl px-4 pt-24 pb-16 text-center">
          <p className="text-sm text-medium-gray">Sign in to view bookmarks</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Bookmarks", href: "/bookmarks" }} />

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Bookmarks</h1>
            <p className="text-sm text-medium-gray">Your saved content</p>
          </div>
          <button
            onClick={() => setShowFolderForm(!showFolderForm)}
            className="px-3 py-1 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors"
          >
            {showFolderForm ? "Cancel" : "+ New Folder"}
          </button>
        </div>

        {showFolderForm && (
          <div className="border border-medium-gray/20 p-4 mb-6 flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs text-medium-gray mb-1 block">Folder name</label>
              <input
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="e.g. Design Inspiration"
                className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
              />
            </div>
            <div>
              <label className="text-xs text-medium-gray mb-1 block">Color</label>
              <input
                value={folderColor}
                onChange={(e) => setFolderColor(e.target.value)}
                type="color"
                className="h-9 w-12 border border-medium-gray/30 bg-black cursor-pointer"
              />
            </div>
            <button
              onClick={createFolder}
              disabled={!folderName.trim()}
              className="px-4 py-2 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors disabled:opacity-50"
            >
              Create
            </button>
          </div>
        )}

        {/* Folders */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveFolder(null)}
            className={`px-3 py-1 text-xs font-semibold transition-colors ${
              activeFolder === null ? "bg-code-green text-black" : "border border-medium-gray/30 text-medium-gray hover:text-light-gray"
            }`}
          >
            All ({bookmarks.length})
          </button>
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setActiveFolder(folder.id)}
              className={`px-3 py-1 text-xs font-semibold transition-colors flex items-center gap-1 ${
                activeFolder === folder.id ? "bg-code-green text-black" : "border border-medium-gray/30 text-medium-gray hover:text-light-gray"
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: folder.color }} />
              {folder.name} ({folder.bookmark_count})
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-medium-gray">Loading...</p>
        ) : bookmarks.length === 0 ? (
          <div className="border border-medium-gray/20 p-8 text-center">
            <p className="text-sm text-medium-gray">No bookmarks yet</p>
            <p className="text-xs text-medium-gray/60 mt-1">Save content from around the platform</p>
          </div>
        ) : (
          <div className="space-y-2">
            {bookmarks.map((bookmark) => (
              <div key={bookmark.id} className="border border-medium-gray/20 p-4 flex items-center justify-between group">
                <div>
                  <Link href={bookmark.url || "#"} className="text-sm font-semibold text-light-gray hover:text-code-green transition-colors">
                    {bookmark.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1 text-xs text-medium-gray">
                    <span className="capitalize">{bookmark.content_type}</span>
                    <span>{formatTimeAgo(bookmark.created_at)}</span>
                  </div>
                </div>
                <button
                  onClick={() => deleteBookmark(bookmark.id)}
                  className="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
