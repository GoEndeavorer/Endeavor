"use client";

import { useState, useRef, useCallback, type ReactNode } from "react";

type Position = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: Position;
}

const positionClasses: Record<Position, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

export function Tooltip({ children, content, position = "top" }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => setVisible(true), 200);
  }, []);

  const hide = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setVisible(false);
  }, []);

  return (
    <span className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {visible && (
        <span
          role="tooltip"
          className={`absolute whitespace-nowrap bg-black border border-medium-gray/30 text-xs text-light-gray px-2 py-1 pointer-events-none ${positionClasses[position]}`}
        >
          {content}
        </span>
      )}
    </span>
  );
}
