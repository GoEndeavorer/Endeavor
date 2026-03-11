"use client";

import { useEffect } from "react";

/**
 * Calls `callback` when a mousedown event occurs outside the element
 * referenced by `ref`. Cleans up the listener on unmount.
 */
export function useClickOutside(
  ref: React.RefObject<HTMLElement>,
  callback: () => void
) {
  useEffect(() => {
    function handleMouseDown(event: MouseEvent) {
      if (
        ref.current &&
        !ref.current.contains(event.target as Node)
      ) {
        callback();
      }
    }

    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [ref, callback]);
}
