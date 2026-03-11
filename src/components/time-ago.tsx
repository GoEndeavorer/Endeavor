"use client";

import { useState, useEffect } from "react";
import { formatTimeAgo } from "@/lib/time";

/**
 * Live-updating relative timestamp component.
 * Updates every 60 seconds for recent times.
 */
export function TimeAgo({ date, className = "" }: { date: string; className?: string }) {
  const [display, setDisplay] = useState(() => formatTimeAgo(date));

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplay(formatTimeAgo(date));
    }, 60000);

    return () => clearInterval(interval);
  }, [date]);

  return (
    <time
      dateTime={date}
      title={new Date(date).toLocaleString()}
      className={className}
    >
      {display}
    </time>
  );
}
