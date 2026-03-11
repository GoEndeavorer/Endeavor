"use client";

import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/toast";

type Collection = {
  id: string;
  name: string;
  itemCount: number;
  containsEndeavor?: boolean;
};

export function BookmarkButton({ endeavorId }: { endeavorId: string }) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showNewInput, setShowNewInput] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setShowNewInput(false);
        setNewName("");
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function fetchCollections() {
    setLoading(true);
    try {
      const res = await fetch("/api/collections");
      if (!res.ok) throw new Error("Failed to load collections");
      const list: Collection[] = await res.json();

      // Check which collections contain this endeavor
      const detailed = await Promise.all(
        list.map(async (c) => {
          try {
            const r = await fetch(`/api/collections/${c.id}`);
            if (!r.ok) return { ...c, containsEndeavor: false };
            const data = await r.json();
            const has = data.items?.some(
              (item: { endeavorId: string }) => item.endeavorId === endeavorId
            );
            return { ...c, containsEndeavor: !!has };
          } catch {
            return { ...c, containsEndeavor: false };
          }
        })
      );

      setCollections(detailed);
    } catch {
      toast("Failed to load collections", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleToggle() {
    if (!open) {
      fetchCollections();
    } else {
      setShowNewInput(false);
      setNewName("");
    }
    setOpen(!open);
  }

  async function handleSave(collectionId: string) {
    setSaving(collectionId);
    try {
      const res = await fetch(`/api/collections/${collectionId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endeavorId }),
      });
      if (res.status === 409) {
        toast("Already in this collection", "info");
        setSaving(null);
        return;
      }
      if (!res.ok) throw new Error("Failed to save");
      toast("Saved to collection", "success");
      setCollections((prev) =>
        prev.map((c) =>
          c.id === collectionId ? { ...c, containsEndeavor: true } : c
        )
      );
    } catch {
      toast("Failed to save", "error");
    } finally {
      setSaving(null);
    }
  }

  async function handleCreate() {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setCreating(true);
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });
      if (!res.ok) throw new Error("Failed to create collection");
      const created = await res.json();
      setNewName("");
      setShowNewInput(false);
      // Save to the new collection immediately
      await handleSave(created.id);
      setCollections((prev) => [
        { id: created.id, name: created.name, itemCount: 1, containsEndeavor: true },
        ...prev,
      ]);
    } catch {
      toast("Failed to create collection", "error");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="text-xs text-medium-gray transition-colors hover:text-code-green font-mono"
      >
        {open ? "_ close" : "+ save"}
      </button>

      {open && (
        <div
          ref={dropdownRef}
          className="absolute right-0 top-full z-50 mt-1 w-56 border border-medium-gray/30 bg-black shadow-lg"
        >
          <div className="border-b border-medium-gray/20 px-3 py-2 text-xs text-medium-gray font-mono">
            collections
          </div>

          <div className="max-h-48 overflow-y-auto">
            {loading ? (
              <div className="px-3 py-3 text-xs text-medium-gray font-mono">
                loading...
              </div>
            ) : collections.length === 0 && !showNewInput ? (
              <div className="px-3 py-3 text-xs text-medium-gray font-mono">
                no collections yet
              </div>
            ) : (
              collections.map((c) => (
                <button
                  key={c.id}
                  onClick={() => !c.containsEndeavor && handleSave(c.id)}
                  disabled={saving === c.id || c.containsEndeavor}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs font-mono transition-colors ${
                    c.containsEndeavor
                      ? "text-code-green/60 cursor-default"
                      : "text-light-gray hover:bg-medium-gray/10 hover:text-code-green"
                  }`}
                >
                  <span className="truncate">
                    {saving === c.id ? "saving..." : c.name}
                  </span>
                  {c.containsEndeavor && (
                    <span className="ml-2 shrink-0 text-code-green">
                      &#10003;
                    </span>
                  )}
                </button>
              ))
            )}
          </div>

          <div className="border-t border-medium-gray/20">
            {showNewInput ? (
              <div className="flex items-center gap-1 px-2 py-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  placeholder="name"
                  autoFocus
                  disabled={creating}
                  className="flex-1 border-b border-medium-gray/30 bg-transparent px-1 py-1 text-xs text-code-green font-mono placeholder:text-medium-gray/50 outline-none focus:border-code-green"
                />
                <button
                  onClick={handleCreate}
                  disabled={creating || !newName.trim()}
                  className="shrink-0 px-2 py-1 text-xs text-code-green font-mono transition-colors hover:text-white disabled:text-medium-gray/40"
                >
                  {creating ? "..." : "ok"}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowNewInput(true)}
                className="w-full px-3 py-2 text-left text-xs text-medium-gray font-mono transition-colors hover:text-code-green"
              >
                + new collection
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
