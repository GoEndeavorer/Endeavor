"use client";

import { useState, useEffect, useRef } from "react";

type StatCounterProps = {
  value: number;
  label: string;
  color?: string;
  duration?: number;
};

export function StatCounter({ value, label, color = "text-code-green", duration = 1000 }: StatCounterProps) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    if (animated.current || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !animated.current) {
          animated.current = true;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setDisplay(Math.round(eased * value));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration]);

  return (
    <div ref={ref} className="text-center">
      <p className={`text-2xl font-bold ${color}`}>{display.toLocaleString()}</p>
      <p className="text-xs text-medium-gray mt-1">{label}</p>
    </div>
  );
}
