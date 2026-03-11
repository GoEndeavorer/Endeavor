"use client";

import { useState, useEffect } from "react";

const shortcuts = [
  { key: "?", description: "Show keyboard shortcuts" },
  { key: "/", description: "Focus search" },
  { key: "k", mod: "Cmd", description: "Open command palette" },
  { key: "n", description: "New endeavor" },
  { key: "d", description: "Go to dashboard" },
  { key: "f", description: "Go to feed" },
  { key: "m", description: "Go to messages" },
  { key: "p", description: "Go to profile" },
  { key: "s", description: "Go to settings" },
  { key: "Escape", description: "Close modals / cancel" },
  { key: "j", description: "Navigate down in lists" },
  { key: "k", description: "Navigate up in lists" },
  { key: "Enter", description: "Open selected item" },
];

export function ShortcutsModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-md border border-medium-gray/30 bg-black p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// keyboard shortcuts"}
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="text-xs text-medium-gray hover:text-light-gray transition-colors"
          >
            [ESC]
          </button>
        </div>
        <div className="space-y-1">
          {shortcuts.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-1.5 border-b border-medium-gray/10 last:border-0">
              <span className="text-sm text-light-gray">{s.description}</span>
              <kbd className="font-mono text-xs text-code-green bg-medium-gray/10 px-2 py-0.5">
                {s.mod ? `${s.mod}+${s.key}` : s.key}
              </kbd>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-medium-gray">
          Press <kbd className="font-mono text-code-green">?</kbd> to toggle this panel
        </p>
      </div>
    </div>
  );
}
