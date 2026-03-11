"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

const shortcutGroups = [
  {
    title: "Navigation",
    shortcuts: [
      { keys: "g h", label: "Go Home" },
      { keys: "g f", label: "Go to Feed" },
      { keys: "g d", label: "Go to Dashboard" },
      { keys: "g m", label: "Go to Messages" },
      { keys: "g n", label: "Go to Notifications" },
      { keys: "g s", label: "Go to Settings" },
      { keys: "g p", label: "Go to Profile" },
      { keys: "g b", label: "Go to Saved" },
    ],
  },
  {
    title: "Actions",
    shortcuts: [
      { keys: "c", label: "Create Endeavor" },
      { keys: "/", label: "Search" },
      { keys: "Cmd K", label: "Quick Search" },
      { keys: "Cmd Shift N", label: "Quick Create" },
      { keys: "?", label: "Show Shortcuts" },
      { keys: "Esc", label: "Close / Cancel" },
    ],
  },
];

const navMap: Record<string, string> = {
  "g h": "/",
  "g f": "/feed",
  "g d": "/dashboard",
  "g m": "/messages",
  "g n": "/notifications",
  "g s": "/settings",
  "g p": "/profile",
  "g b": "/saved",
};

export function KeyboardShortcuts() {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);
  const pendingRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [showPending, setShowPending] = useState(false);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key;

      if (key === "Escape") {
        setShowHelp(false);
        pendingRef.current = null;
        setShowPending(false);
        return;
      }

      if (key === "?" || (key === "/" && e.shiftKey)) {
        e.preventDefault();
        setShowHelp((prev) => !prev);
        return;
      }

      // Handle pending "g" prefix
      if (pendingRef.current === "g") {
        pendingRef.current = null;
        setShowPending(false);
        clearTimeout(timerRef.current);
        const combo = `g ${key}`;
        if (navMap[combo]) {
          e.preventDefault();
          router.push(navMap[combo]);
        }
        return;
      }

      if (key === "g") {
        pendingRef.current = "g";
        setShowPending(true);
        timerRef.current = setTimeout(() => {
          pendingRef.current = null;
          setShowPending(false);
        }, 1500);
        return;
      }

      if (key === "/") {
        e.preventDefault();
        router.push("/search");
        return;
      }

      if (key === "c") {
        router.push("/endeavors/create");
        return;
      }
    },
    [router]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timerRef.current);
    };
  }, [handleKeyDown]);

  return (
    <>
      {showPending && (
        <div className="fixed bottom-4 right-4 z-[70] border border-medium-gray/30 bg-black px-3 py-1.5 text-xs text-medium-gray animate-in fade-in">
          <kbd className="text-code-green font-mono">g</kbd> + ...
        </div>
      )}

      {showHelp && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 px-4"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="w-full max-w-md border border-medium-gray/30 bg-black p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-code-green">
                Keyboard Shortcuts
              </h3>
              <button
                onClick={() => setShowHelp(false)}
                className="text-xs text-medium-gray hover:text-white"
              >
                ESC
              </button>
            </div>
            {shortcutGroups.map((group) => (
              <div key={group.title} className="mb-4">
                <h4 className="mb-2 text-xs font-semibold text-code-blue uppercase tracking-wider">
                  {group.title}
                </h4>
                <div className="space-y-1.5">
                  {group.shortcuts.map((s) => (
                    <div
                      key={s.keys}
                      className="flex items-center justify-between py-0.5"
                    >
                      <span className="text-sm text-light-gray">{s.label}</span>
                      <div className="flex gap-1">
                        {s.keys.split(" ").map((k, i) => (
                          <span key={i} className="flex items-center gap-1">
                            {i > 0 && (
                              <span className="text-medium-gray/40 text-xs">then</span>
                            )}
                            <kbd className="border border-medium-gray/30 bg-medium-gray/10 px-2 py-0.5 text-xs font-mono text-code-green">
                              {k}
                            </kbd>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <p className="mt-2 text-xs text-medium-gray">
              Press <kbd className="border border-medium-gray/30 px-1 text-[10px] text-code-green">?</kbd> to toggle
            </p>
          </div>
        </div>
      )}
    </>
  );
}
