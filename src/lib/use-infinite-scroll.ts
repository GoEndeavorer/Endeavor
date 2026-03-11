"use client";

import { useEffect, useRef, useCallback } from "react";

interface UseInfiniteScrollOptions {
  /** Margin in pixels before the sentinel enters the viewport (default 200) */
  threshold?: number;
  /** Whether infinite scrolling is active (default true) */
  enabled?: boolean;
}

/**
 * Infinite scroll hook using IntersectionObserver.
 * Attach the returned `sentinelRef` to a div at the bottom of your list.
 * When that element comes within `threshold` pixels of the viewport,
 * `callback` fires.
 */
export function useInfiniteScroll(
  callback: () => void,
  options?: UseInfiniteScrollOptions
) {
  const { threshold = 200, enabled = true } = options ?? {};
  const sentinelRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(callback);

  // Keep the callback ref current so the observer always calls the latest fn
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry?.isIntersecting) {
        callbackRef.current();
      }
    },
    []
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!enabled || !sentinel) return;

    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: `0px 0px ${threshold}px 0px`,
    });

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [enabled, threshold, handleIntersect]);

  return { sentinelRef };
}
