"use client";

import { useState, useEffect } from "react";

/**
 * A quick scratch-pad note component that persists to localStorage.
 * Useful for jotting down thoughts during a session.
 */
export function QuickNote() {
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("endeavor-quick-note");
    if (stored) setNote(stored);
  }, []);

  function save() {
    localStorage.setItem("endeavor-quick-note", note);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="border border-medium-gray/20 p-3 text-xs text-medium-gray hover:text-code-green hover:border-code-green/30 transition-colors w-full text-left"
      >
        {"// quick note"} {note ? "(has content)" : "(empty)"}
      </button>
    );
  }

  return (
    <div className="border border-medium-gray/20 p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// quick note"}
        </h4>
        <button
          onClick={() => setExpanded(false)}
          className="text-xs text-medium-gray hover:text-light-gray"
        >
          collapse
        </button>
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={save}
        placeholder="Jot down thoughts..."
        className="w-full h-24 bg-transparent border border-medium-gray/20 p-2 text-sm text-light-gray outline-none focus:border-code-green/50 resize-none font-mono"
      />
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-medium-gray">
          {note.length} chars
        </span>
        {saved && (
          <span className="text-xs text-code-green">Saved</span>
        )}
      </div>
    </div>
  );
}
