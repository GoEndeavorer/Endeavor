"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Insight = {
  type: "tip" | "alert" | "milestone" | "suggestion";
  icon: string;
  message: string;
  action?: { label: string; href: string };
};

export function DashboardInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/insights")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setInsights(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-12 animate-pulse bg-medium-gray/10" />
        ))}
      </div>
    );
  }

  if (insights.length === 0) return null;

  const typeColors: Record<string, string> = {
    tip: "border-code-blue/30 bg-code-blue/5",
    alert: "border-yellow-400/30 bg-yellow-400/5",
    milestone: "border-code-green/30 bg-code-green/5",
    suggestion: "border-purple-400/30 bg-purple-400/5",
  };

  const iconColors: Record<string, string> = {
    tip: "text-code-blue",
    alert: "text-yellow-400",
    milestone: "text-code-green",
    suggestion: "text-purple-400",
  };

  return (
    <div>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
        {"// insights"}
      </h3>
      <div className="space-y-2">
        {insights.slice(0, 5).map((insight, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 border p-3 ${typeColors[insight.type] || "border-medium-gray/20"}`}
          >
            <span className={`mt-0.5 font-mono text-sm font-bold ${iconColors[insight.type] || "text-medium-gray"}`}>
              {insight.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-light-gray">{insight.message}</p>
              {insight.action && (
                <Link
                  href={insight.action.href}
                  className="mt-1 inline-block text-xs text-code-blue hover:text-code-green transition-colors"
                >
                  {insight.action.label} &rarr;
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
