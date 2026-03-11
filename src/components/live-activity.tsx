"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

const POLL_INTERVAL = 60_000;
const DISMISS_DELAY = 5_000;

export function LiveActivity() {
  const [newCount, setNewCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const lastCountRef = useRef<number | null>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    setVisible(false);
    if (dismissTimer.current) {
      clearTimeout(dismissTimer.current);
      dismissTimer.current = null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function poll() {
      try {
        const res = await fetch("/api/notifications/count");
        if (!res.ok) return;
        const data = await res.json();
        const count: number = data.count ?? 0;

        if (!mounted) return;

        if (lastCountRef.current !== null && count > lastCountRef.current) {
          const diff = count - lastCountRef.current;
          setNewCount(diff);
          setVisible(true);

          if (dismissTimer.current) clearTimeout(dismissTimer.current);
          dismissTimer.current = setTimeout(() => {
            if (mounted) setVisible(false);
          }, DISMISS_DELAY);
        }

        lastCountRef.current = count;
      } catch {
        // silently ignore fetch errors
      }
    }

    poll();
    const id = setInterval(poll, POLL_INTERVAL);

    return () => {
      mounted = false;
      clearInterval(id);
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[75] flex items-center justify-center px-4 py-2 bg-code-green/10 border-b border-code-green/30 text-code-green text-xs font-mono animate-slide-in-top"
      role="status"
      aria-live="polite"
    >
      <span>
        {newCount} new notification{newCount !== 1 ? "s" : ""}
      </span>
      <Link
        href="/notifications"
        className="ml-2 underline underline-offset-2 hover:text-code-green/80"
        onClick={dismiss}
      >
        View
      </Link>
      <button
        onClick={dismiss}
        className="ml-3 text-code-green/60 hover:text-code-green"
        aria-label="Dismiss notification"
      >
        &times;
      </button>
    </div>
  );
}
