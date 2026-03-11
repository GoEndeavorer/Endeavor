"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const categories = ["Adventure", "Scientific", "Creative", "Tech", "Cultural", "Community"];

export function QuickCreateModal() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Tech");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      // Ctrl/Cmd + K to open quick create
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/endeavors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || title.trim(),
          category,
          locationType: "either",
          joinType: "open",
          status: "open",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create");
        return;
      }

      const data = await res.json();
      setOpen(false);
      setTitle("");
      setDescription("");
      router.push(`/endeavors/${data.id}/dashboard`);
    } catch {
      setError("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center bg-black/80 px-4 pt-[15vh]"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg border border-medium-gray/30 bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-medium-gray/20 px-4 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green">
            Quick Create
          </h2>
          <div className="flex items-center gap-2">
            <kbd className="border border-medium-gray/30 bg-medium-gray/10 px-1.5 py-0.5 text-[10px] text-medium-gray">ESC</kbd>
            <button
              onClick={() => setOpen(false)}
              className="text-xs text-medium-gray hover:text-white"
            >
              close
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you want to do?"
            className="w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
            maxLength={100}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description (optional)..."
            rows={2}
            className="w-full border border-medium-gray/30 bg-transparent px-4 py-2 text-sm text-light-gray outline-none focus:border-code-green resize-none"
            maxLength={500}
          />
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`border px-3 py-1 text-xs transition-colors ${
                  category === cat
                    ? "border-code-green bg-code-green text-black font-semibold"
                    : "border-medium-gray/30 text-medium-gray hover:border-code-green hover:text-code-green"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {error && (
            <p className="text-xs text-red-400">{error}</p>
          )}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push("/endeavors/create");
              }}
              className="text-xs text-code-blue hover:text-code-green"
            >
              Full form &rarr;
            </button>
            <button
              type="submit"
              disabled={!title.trim() || submitting}
              className="border border-code-green px-6 py-2 text-xs font-bold uppercase text-code-green transition-colors hover:bg-code-green hover:text-black disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
