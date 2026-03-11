"use client";

import { useState, useEffect } from "react";

type TrustLevel = "new" | "basic" | "trusted" | "established" | "pillar";

type ReputationData = {
  score: number;
  trustLevel: TrustLevel;
};

const trustConfig: Record<TrustLevel, { label: string; color: string; icon: string }> = {
  new: { label: "New", color: "text-medium-gray border-medium-gray/30", icon: "." },
  basic: { label: "Basic", color: "text-code-blue border-code-blue/30", icon: "~" },
  trusted: { label: "Trusted", color: "text-code-green border-code-green/30", icon: "+" },
  established: { label: "Established", color: "text-purple-400 border-purple-400/30", icon: "*" },
  pillar: { label: "Pillar", color: "text-yellow-400 border-yellow-400/30", icon: "#" },
};

export function TrustBadge({ userId }: { userId: string }) {
  const [data, setData] = useState<ReputationData | null>(null);

  useEffect(() => {
    fetch(`/api/users/${userId}/reputation`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => {});
  }, [userId]);

  if (!data) return null;

  const config = trustConfig[data.trustLevel] || trustConfig.new;

  return (
    <span
      className={`inline-flex items-center gap-1 border px-1.5 py-0.5 text-xs font-bold uppercase ${config.color}`}
      title={`Trust score: ${data.score}/100`}
    >
      <span className="font-mono">{config.icon}</span>
      {config.label}
    </span>
  );
}
