"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function KeyboardShortcuts() {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger when typing in inputs
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // ? - show keyboard shortcuts help
      if (e.key === "?" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShowHelp((prev) => !prev);
        return;
      }

      // g then f - go to feed
      if (e.key === "Escape") {
        setShowHelp(false);
        return;
      }

      // Single key shortcuts (only when no modifier keys)
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key) {
        case "h":
          router.push("/");
          break;
        case "f":
          router.push("/feed");
          break;
        case "n":
          router.push("/endeavors/create");
          break;
        case "p":
          router.push("/profile");
          break;
        case "s":
          router.push("/saved");
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  if (!showHelp) return null;

  const shortcuts = [
    { keys: "⌘ K", action: "Search" },
    { keys: "?", action: "Toggle this help" },
    { keys: "H", action: "Go home" },
    { keys: "F", action: "Go to feed" },
    { keys: "N", action: "New endeavor" },
    { keys: "P", action: "Go to profile" },
    { keys: "S", action: "Go to saved" },
    { keys: "Esc", action: "Close" },
  ];

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 px-4"
      onClick={() => setShowHelp(false)}
    >
      <div
        className="w-full max-w-sm border border-medium-gray/30 bg-black p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
          Keyboard Shortcuts
        </h3>
        <div className="space-y-2">
          {shortcuts.map((s) => (
            <div
              key={s.keys}
              className="flex items-center justify-between py-1"
            >
              <span className="text-sm text-medium-gray">{s.action}</span>
              <kbd className="border border-medium-gray/30 bg-medium-gray/10 px-2 py-0.5 text-xs text-white">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-medium-gray">
          Press <kbd className="border border-medium-gray/30 px-1 text-[10px]">?</kbd> to toggle
        </p>
      </div>
    </div>
  );
}
