"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";

type Note = {
  id: string;
  title: string | null;
  content: string;
  pinned: boolean;
  endeavor_id: string | null;
  created_at: string;
  updated_at: string;
};

export default function NotesPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    if (!session) return;
    fetch("/api/user-notes")
      .then((r) => (r.ok ? r.json() : []))
      .then(setNotes)
      .finally(() => setLoading(false));
  }, [session]);

  async function createNote() {
    if (!content.trim()) return;
    setSubmitting(true);
    const res = await fetch("/api/user-notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title || undefined, content: content.trim() }),
    });
    if (res.ok) {
      const note = await res.json();
      setNotes((prev) => [note, ...prev]);
      setTitle("");
      setContent("");
      setShowForm(false);
      toast("Note created!", "success");
    }
    setSubmitting(false);
  }

  async function deleteNote(id: string) {
    const res = await fetch(`/api/user-notes?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setNotes((prev) => prev.filter((n) => n.id !== id));
      toast("Deleted", "success");
    }
  }

  async function togglePin(id: string, pinned: boolean) {
    const res = await fetch("/api/user-notes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, pinned: !pinned }),
    });
    if (res.ok) {
      setNotes((prev) =>
        prev
          .map((n) => (n.id === id ? { ...n, pinned: !pinned } : n))
          .sort((a, b) => (a.pinned === b.pinned ? 0 : a.pinned ? -1 : 1))
      );
    }
  }

  async function saveEdit(id: string) {
    if (!editContent.trim()) return;
    const res = await fetch("/api/user-notes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, content: editContent.trim() }),
    });
    if (res.ok) {
      setNotes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, content: editContent.trim(), updated_at: new Date().toISOString() } : n))
      );
      setEditingId(null);
      toast("Saved", "success");
    }
  }

  if (!session) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Notes", href: "/notes" }} />
        <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
          <p className="text-sm text-medium-gray">Please log in to view your notes.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Notes", href: "/notes" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Notes</h1>
            <p className="text-sm text-medium-gray">Your personal scratchpad</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 text-xs font-semibold border border-code-green bg-code-green text-black hover:bg-transparent hover:text-code-green transition-colors"
          >
            {showForm ? "Cancel" : "New Note"}
          </button>
        </div>

        {showForm && (
          <div className="border border-medium-gray/20 p-4 mb-6 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// new note"}
            </h2>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title (optional)"
              className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your note..."
              rows={5}
              className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray resize-y font-mono"
            />
            <button
              onClick={createNote}
              disabled={submitting || !content.trim()}
              className="px-4 py-2 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save Note"}
            </button>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-medium-gray">Loading...</p>
        ) : notes.length === 0 ? (
          <div className="border border-medium-gray/20 p-8 text-center">
            <p className="text-sm text-medium-gray">No notes yet. Create your first one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className={`border p-4 ${
                  note.pinned ? "border-code-green/30 bg-code-green/5" : "border-medium-gray/20"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    {note.title && (
                      <h3 className="text-sm font-semibold text-light-gray">{note.title}</h3>
                    )}
                    <span className="text-xs text-medium-gray">{formatTimeAgo(note.updated_at)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => togglePin(note.id, note.pinned)}
                      className={`text-xs ${note.pinned ? "text-code-green" : "text-medium-gray hover:text-code-green"} transition-colors`}
                    >
                      {note.pinned ? "Unpin" : "Pin"}
                    </button>
                    <button
                      onClick={() => {
                        if (editingId === note.id) {
                          setEditingId(null);
                        } else {
                          setEditingId(note.id);
                          setEditContent(note.content);
                        }
                      }}
                      className="text-xs text-medium-gray hover:text-code-blue transition-colors"
                    >
                      {editingId === note.id ? "Cancel" : "Edit"}
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-xs text-medium-gray hover:text-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {editingId === note.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={4}
                      className="w-full border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white font-mono resize-y"
                    />
                    <button
                      onClick={() => saveEdit(note.id)}
                      className="px-3 py-1 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-light-gray/80 whitespace-pre-wrap font-mono">
                    {note.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
