"use client";

import { useState, useEffect } from "react";

type CountdownTimerProps = {
  targetDate: string;
  label?: string;
  onComplete?: () => void;
};

export function CountdownTimer({ targetDate, label, onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    function calculate() {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setExpired(true);
        onComplete?.();
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate, onComplete]);

  if (expired) {
    return (
      <div className="text-center">
        {label && <p className="text-xs text-medium-gray mb-1">{label}</p>}
        <p className="text-sm text-code-green font-bold">Completed!</p>
      </div>
    );
  }

  return (
    <div className="text-center">
      {label && <p className="text-xs text-medium-gray mb-2">{label}</p>}
      <div className="flex items-center justify-center gap-2">
        {[
          { value: timeLeft.days, label: "d" },
          { value: timeLeft.hours, label: "h" },
          { value: timeLeft.minutes, label: "m" },
          { value: timeLeft.seconds, label: "s" },
        ].map((unit) => (
          <div key={unit.label} className="flex items-baseline gap-0.5">
            <span className="text-lg font-bold text-light-gray font-mono tabular-nums">
              {String(unit.value).padStart(2, "0")}
            </span>
            <span className="text-xs text-medium-gray">{unit.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
