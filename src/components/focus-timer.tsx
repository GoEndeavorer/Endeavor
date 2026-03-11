"use client";

import { useState, useEffect, useRef, useCallback } from "react";

type FocusTimerProps = {
  onComplete?: (minutes: number) => void;
};

export function FocusTimer({ onComplete }: FocusTimerProps) {
  const [duration, setDuration] = useState(25); // minutes
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function start() {
    setTimeLeft(duration * 60);
    setIsRunning(true);
    setIsComplete(false);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stop();
          setIsComplete(true);
          onComplete?.(duration);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function reset() {
    stop();
    setTimeLeft(0);
    setIsComplete(false);
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progress = isRunning || isComplete ? ((duration * 60 - timeLeft) / (duration * 60)) * 100 : 0;

  return (
    <div className="border border-medium-gray/20 p-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-code-green mb-3">
        {"// focus timer"}
      </h3>

      {!isRunning && !isComplete ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {[15, 25, 45, 60].map((m) => (
              <button
                key={m}
                onClick={() => setDuration(m)}
                className={`px-3 py-1 text-xs border transition-colors ${
                  duration === m ? "border-code-green text-code-green" : "border-medium-gray/30 text-medium-gray hover:text-light-gray"
                }`}
              >
                {m}m
              </button>
            ))}
          </div>
          <button
            onClick={start}
            className="px-4 py-2 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors"
          >
            Start Focus
          </button>
        </div>
      ) : (
        <div>
          <div className="text-center mb-3">
            <p className={`text-3xl font-bold font-mono ${isComplete ? "text-code-green" : "text-light-gray"}`}>
              {isComplete ? "Done!" : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`}
            </p>
          </div>
          <div className="h-1 bg-medium-gray/20 mb-3">
            <div
              className={`h-full transition-all ${isComplete ? "bg-code-green" : "bg-code-blue"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex gap-2">
            {isRunning && (
              <button onClick={stop} className="px-3 py-1 text-xs border border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black transition-colors">
                Pause
              </button>
            )}
            <button onClick={reset} className="px-3 py-1 text-xs border border-medium-gray/30 text-medium-gray hover:text-light-gray transition-colors">
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
