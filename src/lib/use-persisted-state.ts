"use client";

import { useState, useEffect, useCallback } from "react";

/**
 * Like useState, but persists the value in localStorage.
 * Falls back to defaultValue if localStorage is unavailable or the key doesn't exist.
 */
export function usePersistedState<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [state, setState] = useState<T>(defaultValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) {
        setState(JSON.parse(stored));
      }
    } catch {}
    setLoaded(true);
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState((prev) => {
        const next = typeof value === "function" ? (value as (prev: T) => T)(prev) : value;
        try {
          localStorage.setItem(key, JSON.stringify(next));
        } catch {}
        return next;
      });
    },
    [key]
  );

  // Only return the stored value after hydration to avoid mismatch
  if (!loaded) return [defaultValue, setValue];
  return [state, setValue];
}
