"use client";

import Link from "next/link";
import { formatTimeAgo } from "@/lib/time";

export type MarketplaceTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  suggestedNeeds: string[];
  suggestedMilestones: string[];
  icon: string;
  locationType: string;
  suggestedCapacity: number;
  avgRating: number;
  ratingCount: number;
  useCount: number;
  reviews: {
    rating: number;
    review: string;
    createdAt: string;
    authorName: string;
    authorImage: string | null;
  }[];
};

const CATEGORY_COLORS: Record<string, string> = {
  "Community Events": "border-pink-400 text-pink-400",
  "Creative Projects": "border-yellow-400 text-yellow-400",
  "Tech Projects": "border-purple-400 text-purple-400",
  Adventure: "border-code-green text-code-green",
  Education: "border-code-blue text-code-blue",
};

const CATEGORY_BG: Record<string, string> = {
  "Community Events": "bg-pink-400/10",
  "Creative Projects": "bg-yellow-400/10",
  "Tech Projects": "bg-purple-400/10",
  Adventure: "bg-code-green/10",
  Education: "bg-code-blue/10",
};

const ICON_MAP: Record<string, string> = {
  terminal: "\u25B8_",
  mountain: "/\\",
  "book-open": "\u25A1\u25A0",
  rocket: "\u2191\u2191",
  leaf: "\u2663",
  code: "</>",
  film: "\u25B6\u25A0",
  flask: "\u2697",
  music: "\u266B",
  bookmark: "\u2261",
  presentation: "\u25A8",
  heart: "\u2665",
};

const LOCATION_LABELS: Record<string, string> = {
  "in-person": "In-Person",
  remote: "Remote",
  either: "In-Person / Remote",
};

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-px">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = rating >= star;
          const half = !filled && rating >= star - 0.5;
          return (
            <span
              key={star}
              className={`text-xs ${
                filled
                  ? "text-yellow-400"
                  : half
                  ? "text-yellow-400/50"
                  : "text-medium-gray/30"
              }`}
            >
              {filled || half ? "\u2605" : "\u2606"}
            </span>
          );
        })}
      </div>
      {count > 0 && (
        <span className="text-[10px] text-medium-gray">
          {rating.toFixed(1)} ({count})
        </span>
      )}
    </div>
  );
}

export function TemplateCard({
  template,
  onPreview,
}: {
  template: MarketplaceTemplate;
  onPreview?: (t: MarketplaceTemplate) => void;
}) {
  const tColor =
    CATEGORY_COLORS[template.category] || "border-medium-gray text-medium-gray";
  const tBg = CATEGORY_BG[template.category] || "bg-medium-gray/10";

  return (
    <div className="group flex flex-col border border-medium-gray/20 bg-white/[0.02] transition-all hover:border-code-green/40 hover:bg-white/[0.04]">
      {/* Icon + Category header */}
      <div className="flex items-start gap-3 p-6 pb-0">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center font-mono text-sm font-bold ${tBg} ${tColor} border`}
        >
          {ICON_MAP[template.icon] || "?"}
        </div>
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <span
              className={`border px-2 py-0.5 text-[10px] uppercase tracking-widest ${tColor}`}
            >
              {template.category}
            </span>
            <span className="text-[10px] text-medium-gray">
              {LOCATION_LABELS[template.locationType] || template.locationType}
            </span>
          </div>
          <h3 className="text-lg font-bold leading-tight text-white">
            {template.name}
          </h3>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-6 pt-3">
        <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-medium-gray">
          {template.description}
        </p>

        {/* Rating + Uses */}
        <div className="mb-3 flex items-center gap-4">
          <StarRating rating={template.avgRating} count={template.ratingCount} />
          {template.useCount > 0 && (
            <span className="text-[10px] text-medium-gray">
              <span className="font-semibold text-code-blue">
                {template.useCount}
              </span>{" "}
              {template.useCount === 1 ? "use" : "uses"}
            </span>
          )}
        </div>

        {/* Needs preview */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {template.suggestedNeeds.slice(0, 3).map((need) => (
            <span
              key={need}
              className="bg-white/5 px-2 py-0.5 text-xs text-neutral-400"
            >
              {need}
            </span>
          ))}
          {template.suggestedNeeds.length > 3 && (
            <span className="px-1 py-0.5 text-xs text-medium-gray">
              +{template.suggestedNeeds.length - 3} more
            </span>
          )}
        </div>

        {/* Meta */}
        <div className="mb-5 mt-auto flex items-center gap-4 text-xs text-medium-gray">
          <span>
            <span className="font-semibold text-code-green">
              {template.suggestedCapacity}
            </span>{" "}
            spots
          </span>
          <span>
            <span className="font-semibold text-code-blue">
              {template.suggestedMilestones.length}
            </span>{" "}
            milestones
          </span>
        </div>

        {/* Recent review teaser */}
        {template.reviews.length > 0 && (
          <div className="mb-4 border-t border-medium-gray/10 pt-3">
            <p className="line-clamp-2 text-xs italic text-neutral-500">
              &ldquo;{template.reviews[0].review}&rdquo;
              <span className="ml-1 not-italic text-medium-gray/60">
                &mdash; {template.reviews[0].authorName},{" "}
                {formatTimeAgo(template.reviews[0].createdAt)}
              </span>
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/endeavors/create?template=${template.id}`}
            className="inline-block border border-code-green bg-code-green px-4 py-2 text-xs font-bold uppercase text-black transition-colors hover:bg-transparent hover:text-code-green"
          >
            Use Template
          </Link>
          {onPreview && (
            <button
              onClick={() => onPreview(template)}
              className="border border-medium-gray/40 px-4 py-2 text-xs font-bold uppercase text-medium-gray transition-colors hover:border-white hover:text-white"
            >
              Preview
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
