"use client";

import { useState, useEffect } from "react";

type RoadmapItem = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  target_date: string | null;
  completed_at: string | null;
};

type RoadmapTimelineProps = {
  endeavorId: string;
};

const statusColors: Record<string, string> = {
  planned: "border-medium-gray/50 text-medium-gray",
  "in-progress": "border-yellow-400/50 text-yellow-400",
  completed: "border-code-green/50 text-code-green",
  delayed: "border-red-400/50 text-red-400",
};

const statusDots: Record<string, string> = {
  planned: "bg-medium-gray",
  "in-progress": "bg-yellow-400",
  completed: "bg-code-green",
  delayed: "bg-red-400",
};

export function RoadmapTimeline({ endeavorId }: RoadmapTimelineProps) {
  const [milestones, setMilestones] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/milestones`)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        const items = Array.isArray(data) ? data : data.milestones || [];
        setMilestones(items);
      })
      .finally(() => setLoading(false));
  }, [endeavorId]);

  if (loading) return <p className="text-sm text-medium-gray">Loading roadmap...</p>;
  if (milestones.length === 0) return null;

  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-code-green mb-4">
        {"// roadmap"}
      </h3>
      <div className="relative pl-6">
        {/* Vertical line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-medium-gray/30" />

        <div className="space-y-4">
          {milestones.map((item) => (
            <div key={item.id} className="relative">
              {/* Dot */}
              <div className={`absolute -left-6 top-1.5 w-3.5 h-3.5 rounded-full border-2 border-black ${statusDots[item.status] || "bg-medium-gray"}`} />

              <div className={`border ${statusColors[item.status] || "border-medium-gray/30 text-medium-gray"} p-3`}>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-light-gray">{item.title}</h4>
                  <span className="text-xs capitalize">{item.status}</span>
                </div>
                {item.description && (
                  <p className="text-xs text-medium-gray line-clamp-2">{item.description}</p>
                )}
                {item.target_date && (
                  <p className="text-xs text-medium-gray mt-1">Target: {new Date(item.target_date).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
