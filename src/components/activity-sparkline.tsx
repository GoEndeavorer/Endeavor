"use client";

import { useState, useEffect } from "react";

type SparklineProps = {
  endeavorId: string;
  days?: number;
  height?: number;
  width?: number;
};

export function ActivitySparkline({ endeavorId, days = 14, height = 24, width = 80 }: SparklineProps) {
  const [points, setPoints] = useState<number[]>([]);

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/activity-sparkline?days=${days}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.points) setPoints(data.points);
      })
      .catch(() => {});
  }, [endeavorId, days]);

  if (points.length < 2) return null;

  const max = Math.max(...points, 1);
  const stepX = width / (points.length - 1);
  const pathData = points
    .map((p, i) => {
      const x = i * stepX;
      const y = height - (p / max) * (height - 2) - 1;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="inline-block"
    >
      <path
        d={pathData}
        fill="none"
        stroke="#00FF00"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
    </svg>
  );
}
