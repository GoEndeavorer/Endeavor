"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MarkdownText } from "@/components/markdown-text";
import { formatTimeAgo } from "@/lib/time";

type EndeavorDetail = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  location: string | null;
  locationType: string;
  needs: string[] | null;
  costPerPerson: number | null;
  capacity: number | null;
  memberCount: number;
  fundingEnabled: boolean;
  fundingGoal: number | null;
  fundingRaised: number;
  imageUrl: string | null;
  creatorId: string;
  createdAt: string;
  creator: { name: string; id: string };
};

export function EndeavorPreviewModal({
  endeavorId,
  onClose,
}: {
  endeavorId: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<EndeavorDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .finally(() => setLoading(false));
  }, [endeavorId]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const statusColors: Record<string, string> = {
    open: "text-code-green border-code-green/30",
    "in-progress": "text-code-blue border-code-blue/30",
    completed: "text-green-400 border-green-400/30",
    draft: "text-medium-gray border-medium-gray/30",
    cancelled: "text-red-400 border-red-400/30",
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg max-h-[80vh] overflow-y-auto border border-medium-gray/30 bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-sm text-medium-gray animate-pulse">Loading...</p>
          </div>
        ) : !data ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-400">Failed to load endeavor</p>
          </div>
        ) : (
          <>
            {data.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.imageUrl}
                alt=""
                className="w-full h-40 object-cover"
              />
            )}
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-bold">{data.title}</h2>
                  <div className="mt-1 flex items-center gap-2 text-xs text-medium-gray">
                    <span
                      className={`border px-1.5 py-0.5 text-[10px] uppercase ${
                        statusColors[data.status] || "text-medium-gray"
                      }`}
                    >
                      {data.status}
                    </span>
                    <span>{data.category}</span>
                    <span>&middot;</span>
                    <span>{formatTimeAgo(data.createdAt)}</span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="shrink-0 ml-4 text-xs text-medium-gray hover:text-white"
                >
                  ESC
                </button>
              </div>

              {/* Description */}
              <div className="mb-4 text-sm text-light-gray leading-relaxed line-clamp-6">
                <MarkdownText content={data.description} />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="border border-medium-gray/20 p-3 text-center">
                  <p className="text-lg font-bold">{data.memberCount}</p>
                  <p className="text-[10px] text-medium-gray">members</p>
                </div>
                <div className="border border-medium-gray/20 p-3 text-center">
                  <p className="text-lg font-bold">
                    {data.costPerPerson ? `$${data.costPerPerson}` : "Free"}
                  </p>
                  <p className="text-[10px] text-medium-gray">to join</p>
                </div>
                <div className="border border-medium-gray/20 p-3 text-center">
                  <p className="text-lg font-bold">
                    {data.locationType === "remote"
                      ? "Remote"
                      : data.location || "Any"}
                  </p>
                  <p className="text-[10px] text-medium-gray">location</p>
                </div>
              </div>

              {/* Needs */}
              {data.needs && data.needs.length > 0 && (
                <div className="mb-4">
                  <p className="mb-2 text-xs text-medium-gray">Looking for:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {data.needs.map((n) => (
                      <span
                        key={n}
                        className="border border-code-blue/20 bg-code-blue/5 px-2 py-0.5 text-xs text-code-blue"
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Funding */}
              {data.fundingEnabled && data.fundingGoal && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-medium-gray mb-1">
                    <span>Funding</span>
                    <span>
                      ${data.fundingRaised.toLocaleString()} / $
                      {data.fundingGoal.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-1.5 bg-medium-gray/10">
                    <div
                      className="h-full bg-yellow-400/60"
                      style={{
                        width: `${Math.min(100, (data.fundingRaised / data.fundingGoal) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Creator */}
              <div className="flex items-center justify-between border-t border-medium-gray/20 pt-4">
                <p className="text-xs text-medium-gray">
                  by{" "}
                  <Link
                    href={`/users/${data.creator.id}`}
                    className="text-code-blue hover:text-code-green"
                    onClick={onClose}
                  >
                    {data.creator.name}
                  </Link>
                </p>
                <Link
                  href={`/endeavors/${data.id}`}
                  className="border border-code-green px-4 py-2 text-xs font-bold text-code-green transition-colors hover:bg-code-green hover:text-black"
                  onClick={onClose}
                >
                  View Full Details
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
