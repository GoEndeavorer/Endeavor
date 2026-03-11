"use client";

import { useEffect, useCallback } from "react";

interface MilestoneCelebrationProps {
  title: string;
  onClose: () => void;
}

const DOT_COUNT = 40;

function generateDots() {
  return Array.from({ length: DOT_COUNT }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.5,
    duration: 1.5 + Math.random() * 2,
    size: 4 + Math.random() * 8,
    color: ["#00FF00", "#00A1D6", "#FFFF00", "#FF6B6B", "#A855F7"][
      Math.floor(Math.random() * 5)
    ],
  }));
}

const dots = generateDots();

export function MilestoneCelebration({
  title,
  onClose,
}: MilestoneCelebrationProps) {
  const dismiss = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    const timer = setTimeout(dismiss, 3000);
    return () => clearTimeout(timer);
  }, [dismiss]);

  return (
    <>
      <style jsx>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes scaleIn {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes pulseGlow {
          0%,
          100% {
            text-shadow: 0 0 20px rgba(0, 255, 0, 0.4);
          }
          50% {
            text-shadow: 0 0 40px rgba(0, 255, 0, 0.8),
              0 0 80px rgba(0, 255, 0, 0.3);
          }
        }
        .celebration-overlay {
          position: fixed;
          inset: 0;
          z-index: 200;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.85);
          cursor: pointer;
        }
        .celebration-heading {
          font-family: var(--font-mono), monospace;
          font-size: clamp(1.5rem, 5vw, 3rem);
          font-weight: 700;
          color: #00ff00;
          letter-spacing: 0.15em;
          animation: scaleIn 0.5s ease-out, pulseGlow 1.5s ease-in-out infinite;
        }
        .celebration-title {
          font-family: var(--font-mono), monospace;
          font-size: clamp(1rem, 3vw, 1.5rem);
          color: #ccc;
          margin-top: 1rem;
          text-align: center;
          padding: 0 1rem;
          animation: scaleIn 0.5s ease-out 0.2s both;
        }
        .confetti-dot {
          position: absolute;
          top: -12px;
          border-radius: 50%;
          pointer-events: none;
          animation: confettiFall linear forwards;
        }
      `}</style>
      <div
        className="celebration-overlay"
        onClick={dismiss}
        role="dialog"
        aria-label="Milestone completed celebration"
      >
        {dots.map((dot) => (
          <span
            key={dot.id}
            className="confetti-dot"
            style={{
              left: `${dot.left}%`,
              width: dot.size,
              height: dot.size,
              backgroundColor: dot.color,
              animationDelay: `${dot.delay}s`,
              animationDuration: `${dot.duration}s`,
            }}
          />
        ))}
        <span className="celebration-heading">MILESTONE COMPLETED</span>
        <span className="celebration-title">{title}</span>
      </div>
    </>
  );
}
