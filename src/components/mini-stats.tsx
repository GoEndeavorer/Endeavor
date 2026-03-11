"use client";

import { useState, useEffect } from "react";

type Stats = {
  total_endeavors: number;
  open_endeavors: number;
  active_endeavors: number;
  completed_endeavors: number;
  total_users: number;
  total_memberships: number;
};

export function MiniStats() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/v1/stats")
      .then((r) => r.json())
      .then((data) => setStats(data.stats))
      .catch(() => {});
  }, []);

  if (!stats) return null;

  const items = [
    { value: stats.total_endeavors, label: "Endeavors", color: "text-code-green" },
    { value: stats.total_users, label: "Users", color: "text-code-blue" },
    { value: stats.total_memberships, label: "Memberships", color: "text-purple-400" },
    { value: stats.completed_endeavors, label: "Completed", color: "text-yellow-400" },
  ];

  return (
    <div className="flex items-center gap-6">
      {items.map((item) => (
        <div key={item.label} className="text-center">
          <p className={`text-lg font-bold ${item.color}`}>
            {item.value.toLocaleString()}
          </p>
          <p className="text-[10px] text-medium-gray uppercase tracking-wider">
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}
