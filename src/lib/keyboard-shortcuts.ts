"use client";

import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

type ShortcutHandler = () => void;

type Shortcut = {
  keys: string[];
  label: string;
  section: string;
  handler: ShortcutHandler;
};

const SEQUENCE_TIMEOUT = 500;

function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  if (target.isContentEditable) return true;
  return false;
}

export function useKeyboardShortcuts({
  onOpenHelp,
  onCloseModal,
}: {
  onOpenHelp: () => void;
  onCloseModal?: () => void;
}) {
  const router = useRouter();
  const sequenceRef = useRef<string[]>([]);
  const sequenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const navigate = useCallback(
    (path: string) => {
      router.push(path);
    },
    [router]
  );

  const focusSearch = useCallback(() => {
    const searchInput = document.querySelector<HTMLInputElement>(
      'input[type="search"], input[name="search"], input[placeholder*="earch"], input[data-search]'
    );
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }, []);

  const shortcuts: Shortcut[] = [
    {
      keys: ["?"],
      label: "Open shortcuts help",
      section: "General",
      handler: onOpenHelp,
    },
    {
      keys: ["/"],
      label: "Focus search",
      section: "General",
      handler: focusSearch,
    },
    {
      keys: ["Escape"],
      label: "Close modal / dropdown",
      section: "General",
      handler: onCloseModal ?? (() => {}),
    },
    {
      keys: ["g", "h"],
      label: "Go to home",
      section: "Navigation",
      handler: () => navigate("/"),
    },
    {
      keys: ["g", "f"],
      label: "Go to feed",
      section: "Navigation",
      handler: () => navigate("/feed"),
    },
    {
      keys: ["g", "d"],
      label: "Go to dashboard",
      section: "Navigation",
      handler: () => navigate("/dashboard"),
    },
    {
      keys: ["g", "m"],
      label: "Go to messages",
      section: "Navigation",
      handler: () => navigate("/messages"),
    },
    {
      keys: ["g", "s"],
      label: "Go to settings",
      section: "Navigation",
      handler: () => navigate("/settings"),
    },
    {
      keys: ["n"],
      label: "New endeavor",
      section: "Create",
      handler: () => navigate("/endeavors/create"),
    },
  ];

  useEffect(() => {
    function resetSequence() {
      sequenceRef.current = [];
      if (sequenceTimerRef.current) {
        clearTimeout(sequenceTimerRef.current);
        sequenceTimerRef.current = null;
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && onCloseModal) {
        onCloseModal();
        resetSequence();
        return;
      }

      if (isEditableTarget(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const key = e.key;

      // Reset the sequence timer on each new keystroke
      if (sequenceTimerRef.current) {
        clearTimeout(sequenceTimerRef.current);
      }

      sequenceRef.current.push(key);

      sequenceTimerRef.current = setTimeout(() => {
        resetSequence();
      }, SEQUENCE_TIMEOUT);

      // Check for matching shortcuts (longest match first)
      for (const shortcut of shortcuts) {
        const seq = sequenceRef.current;
        const keys = shortcut.keys;

        if (keys.length === 1 && seq.length >= 1 && seq[seq.length - 1] === keys[0]) {
          // Single-key shortcut: only match if this is the first key in the sequence
          // (prevents "g" then "?" from triggering "?" after "g" sequence fails)
          if (seq.length === 1) {
            e.preventDefault();
            shortcut.handler();
            resetSequence();
            return;
          }
        }

        if (
          keys.length > 1 &&
          seq.length >= keys.length &&
          keys.every((k, i) => seq[seq.length - keys.length + i] === k)
        ) {
          e.preventDefault();
          shortcut.handler();
          resetSequence();
          return;
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      resetSequence();
    };
  }, [shortcuts, onCloseModal]);

  return shortcuts;
}
