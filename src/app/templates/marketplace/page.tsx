"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { TemplateCard, type MarketplaceTemplate } from "@/components/template-card";
import { useSession } from "@/lib/auth-client";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";

const CATEGORY_ORDER = [
  "Community Events",
  "Creative Projects",
  "Tech Projects",
  "Adventure",
  "Education",
];

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

const SORT_OPTIONS = [
  { value: "popular", label: "Most Popular" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest" },
];

export default function MarketplacePage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<MarketplaceTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sort, setSort] = useState("popular");
  const [previewTemplate, setPreviewTemplate] = useState<MarketplaceTemplate | null>(null);
  const [ratingTemplate, setRatingTemplate] = useState<MarketplaceTemplate | null>(null);
  const [userRating, setUserRating] = useState(0);
  const [userReview, setUserReview] = useState("");
  const [submittingRating, setSubmittingRating] = useState(false);
  const [hoverStar, setHoverStar] = useState(0);

  const fetchTemplates = useCallback(() => {
    const params = new URLSearchParams();
    if (activeCategory) params.set("category", activeCategory);
    if (search) params.set("search", search);
    params.set("sort", sort);

    fetch(`/api/templates/marketplace?${params}`)
      .then((res) => res.json())
      .then((data: MarketplaceTemplate[]) => {
        setTemplates(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeCategory, search, sort]);

  useEffect(() => {
    setLoading(true);
    fetchTemplates();
  }, [fetchTemplates]);

  const categories = useMemo(() => {
    const present = new Set(templates.map((t) => t.category));
    return CATEGORY_ORDER.filter((c) => present.has(c));
  }, [templates]);

  const grouped = useMemo(() => {
    const map = new Map<string, MarketplaceTemplate[]>();
    for (const t of templates) {
      const list = map.get(t.category) || [];
      list.push(t);
      map.set(t.category, list);
    }
    return CATEGORY_ORDER.filter((c) => map.has(c)).map((c) => ({
      category: c,
      items: map.get(c)!,
    }));
  }, [templates]);

  const handleRate = async () => {
    if (!ratingTemplate || !userRating) return;
    setSubmittingRating(true);

    try {
      const res = await fetch(`/api/templates/${ratingTemplate.id}/rate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: userRating,
          review: userReview.trim() || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        toast(err.error || "Failed to submit rating", "error");
        return;
      }

      toast("Rating submitted!", "success");
      setRatingTemplate(null);
      setUserRating(0);
      setUserReview("");
      fetchTemplates();
    } catch {
      toast("Failed to submit rating", "error");
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <>
      <AppHeader
        breadcrumb={{ label: "Template Marketplace", href: "/templates/marketplace" }}
      />

      <main className="min-h-screen bg-black pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-4">
          {/* Header */}
          <div className="mb-10">
            <h1 className="mb-2 text-3xl font-bold">
              <span className="text-code-green">{">"}</span> Template
              Marketplace
            </h1>
            <p className="max-w-xl text-medium-gray">
              Community-rated templates to jump-start your endeavor. Browse by
              category, sort by popularity or rating, and find the perfect
              starting point.
            </p>
            <div className="mt-4 flex gap-3">
              <Link
                href="/templates"
                className="border border-medium-gray/40 px-4 py-2 text-xs font-bold uppercase text-medium-gray transition-colors hover:border-white hover:text-white"
              >
                All Templates
              </Link>
            </div>
          </div>

          {/* Search + Sort + Filter Bar */}
          <div className="mb-8 flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-code-green">
                  $
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="search marketplace..."
                  className="w-full border border-medium-gray/30 bg-black pl-8 pr-4 py-2.5 font-mono text-sm text-white outline-none placeholder:text-medium-gray/50 focus:border-code-green"
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-medium-gray hover:text-white"
                  >
                    clear
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-medium-gray">Sort:</span>
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSort(opt.value)}
                    className={`border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                      sort === opt.value
                        ? "border-code-green bg-code-green text-black"
                        : "border-medium-gray/40 text-medium-gray hover:border-white hover:text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                  !activeCategory
                    ? "border-code-green bg-code-green text-black"
                    : "border-medium-gray/40 text-medium-gray hover:border-white hover:text-white"
                }`}
              >
                All
              </button>
              {CATEGORY_ORDER.map((cat) => {
                const colorClass =
                  CATEGORY_COLORS[cat] || "border-medium-gray text-medium-gray";
                return (
                  <button
                    key={cat}
                    onClick={() =>
                      setActiveCategory(activeCategory === cat ? null : cat)
                    }
                    className={`border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors ${
                      activeCategory === cat
                        ? colorClass + " bg-white/10"
                        : "border-medium-gray/40 text-medium-gray hover:border-white hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results count */}
          {!loading && (
            <p className="mb-6 font-mono text-xs text-medium-gray">
              {templates.length} template{templates.length !== 1 ? "s" : ""}{" "}
              {search || activeCategory ? "matched" : "available"}
            </p>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse border border-medium-gray/20 p-6"
                >
                  <div className="mb-3 h-10 w-10 bg-medium-gray/10" />
                  <div className="mb-2 h-4 w-20 bg-medium-gray/10" />
                  <div className="mb-2 h-6 w-3/4 bg-medium-gray/10" />
                  <div className="mb-4 h-12 w-full bg-medium-gray/10" />
                  <div className="mb-4 flex gap-2">
                    <div className="h-5 w-16 bg-medium-gray/10" />
                    <div className="h-5 w-20 bg-medium-gray/10" />
                  </div>
                  <div className="h-8 w-32 bg-medium-gray/10" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && templates.length === 0 && (
            <div className="py-20 text-center">
              <p className="mb-2 font-mono text-lg text-medium-gray">
                No templates match your search.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setActiveCategory(null);
                }}
                className="text-sm text-code-green hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}

          {/* Template grid -- grouped by category */}
          {!loading &&
            grouped.map(({ category, items }) => {
              const colorClass =
                CATEGORY_COLORS[category] ||
                "border-medium-gray text-medium-gray";
              const categoryColor = colorClass.split(" ").pop() || "";

              return (
                <section key={category} className="mb-12">
                  <h2
                    className={`mb-5 font-mono text-xs font-semibold uppercase tracking-widest ${categoryColor}`}
                  >
                    {"// " + category}
                  </h2>

                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        onPreview={(t) => setPreviewTemplate(t)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
        </div>
      </main>

      {/* Preview Modal */}
      {previewTemplate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto border border-medium-gray/30 bg-neutral-950"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 flex items-center justify-between border-b border-medium-gray/20 bg-neutral-950 px-6 py-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center font-mono text-xs font-bold ${
                    CATEGORY_BG[previewTemplate.category] || "bg-medium-gray/10"
                  } ${
                    CATEGORY_COLORS[previewTemplate.category] ||
                    "border-medium-gray text-medium-gray"
                  } border`}
                >
                  {ICON_MAP[previewTemplate.icon] || "?"}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    {previewTemplate.name}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-medium-gray">
                    <span
                      className={`border px-1.5 py-0.5 text-[10px] uppercase tracking-widest ${
                        CATEGORY_COLORS[previewTemplate.category] ||
                        "border-medium-gray text-medium-gray"
                      }`}
                    >
                      {previewTemplate.category}
                    </span>
                    <span>
                      {LOCATION_LABELS[previewTemplate.locationType]}
                    </span>
                    <span>{previewTemplate.suggestedCapacity} spots</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="flex h-8 w-8 items-center justify-center text-medium-gray transition-colors hover:text-white"
              >
                <span className="text-lg leading-none">&times;</span>
              </button>
            </div>

            {/* Modal body */}
            <div className="space-y-6 p-6">
              {/* Rating summary */}
              <div className="flex items-center gap-4">
                <div className="flex gap-px">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-sm ${
                        previewTemplate.avgRating >= star
                          ? "text-yellow-400"
                          : previewTemplate.avgRating >= star - 0.5
                          ? "text-yellow-400/50"
                          : "text-medium-gray/30"
                      }`}
                    >
                      {previewTemplate.avgRating >= star ||
                      previewTemplate.avgRating >= star - 0.5
                        ? "\u2605"
                        : "\u2606"}
                    </span>
                  ))}
                </div>
                <span className="text-xs text-medium-gray">
                  {previewTemplate.avgRating > 0
                    ? `${previewTemplate.avgRating.toFixed(1)} avg`
                    : "No ratings yet"}
                  {previewTemplate.ratingCount > 0 &&
                    ` (${previewTemplate.ratingCount} ${
                      previewTemplate.ratingCount === 1 ? "rating" : "ratings"
                    })`}
                </span>
                <span className="text-xs text-medium-gray">
                  <span className="font-semibold text-code-blue">
                    {previewTemplate.useCount}
                  </span>{" "}
                  {previewTemplate.useCount === 1 ? "use" : "uses"}
                </span>
              </div>

              {/* Description */}
              <div>
                <h3 className="mb-2 font-mono text-xs font-semibold uppercase tracking-widest text-code-green">
                  {"// Description"}
                </h3>
                <p className="text-sm leading-relaxed text-neutral-300">
                  {previewTemplate.description}
                </p>
              </div>

              {/* Suggested Needs */}
              <div>
                <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-code-green">
                  {"// Suggested Needs"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {previewTemplate.suggestedNeeds.map((need) => (
                    <span
                      key={need}
                      className="border border-medium-gray/30 bg-white/5 px-3 py-1.5 text-xs text-neutral-300"
                    >
                      {need}
                    </span>
                  ))}
                </div>
              </div>

              {/* Milestones */}
              <div>
                <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-code-green">
                  {"// Milestones"}
                </h3>
                <ol className="space-y-2">
                  {previewTemplate.suggestedMilestones.map(
                    (milestone, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-medium-gray/30 font-mono text-[10px] text-medium-gray">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="pt-0.5 text-sm text-neutral-300">
                          {milestone}
                        </span>
                      </li>
                    )
                  )}
                </ol>
              </div>

              {/* Reviews */}
              {previewTemplate.reviews.length > 0 && (
                <div>
                  <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-code-green">
                    {"// Reviews"}
                  </h3>
                  <div className="space-y-3">
                    {previewTemplate.reviews.map((review, i) => (
                      <div
                        key={i}
                        className="border border-medium-gray/10 bg-white/[0.02] p-4"
                      >
                        <div className="mb-2 flex items-center gap-2">
                          {review.authorImage ? (
                            <img
                              src={review.authorImage}
                              alt=""
                              className="h-5 w-5 rounded-full"
                            />
                          ) : (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-medium-gray/20 text-[8px] text-medium-gray">
                              {review.authorName?.charAt(0) || "?"}
                            </div>
                          )}
                          <span className="text-xs font-semibold text-white">
                            {review.authorName}
                          </span>
                          <div className="flex gap-px">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <span
                                key={s}
                                className={`text-[10px] ${
                                  review.rating >= s
                                    ? "text-yellow-400"
                                    : "text-medium-gray/30"
                                }`}
                              >
                                {review.rating >= s ? "\u2605" : "\u2606"}
                              </span>
                            ))}
                          </div>
                          <span className="text-[10px] text-medium-gray">
                            {formatTimeAgo(review.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed text-neutral-400">
                          {review.review}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="sticky bottom-0 flex gap-3 border-t border-medium-gray/20 bg-neutral-950 px-6 py-4">
              <Link
                href={`/endeavors/create?template=${previewTemplate.id}`}
                className="border border-code-green bg-code-green px-6 py-2.5 text-xs font-bold uppercase text-black transition-colors hover:bg-transparent hover:text-code-green"
              >
                Use This Template
              </Link>
              {session && (
                <button
                  onClick={() => {
                    setRatingTemplate(previewTemplate);
                    setPreviewTemplate(null);
                  }}
                  className="border border-yellow-400/40 px-6 py-2.5 text-xs font-bold uppercase text-yellow-400 transition-colors hover:border-yellow-400 hover:bg-yellow-400/10"
                >
                  Rate
                </button>
              )}
              <button
                onClick={() => setPreviewTemplate(null)}
                className="border border-medium-gray/40 px-6 py-2.5 text-xs font-bold uppercase text-medium-gray transition-colors hover:border-white hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {ratingTemplate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => {
            setRatingTemplate(null);
            setUserRating(0);
            setUserReview("");
          }}
        >
          <div
            className="w-full max-w-md border border-medium-gray/30 bg-neutral-950"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-medium-gray/20 px-6 py-4">
              <h2 className="text-lg font-bold text-white">
                Rate {ratingTemplate.name}
              </h2>
              <button
                onClick={() => {
                  setRatingTemplate(null);
                  setUserRating(0);
                  setUserReview("");
                }}
                className="flex h-8 w-8 items-center justify-center text-medium-gray transition-colors hover:text-white"
              >
                <span className="text-lg leading-none">&times;</span>
              </button>
            </div>

            <div className="space-y-4 p-6">
              <div>
                <h3 className="mb-2 font-mono text-xs font-semibold uppercase tracking-widest text-code-green">
                  {"// Your Rating"}
                </h3>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onMouseEnter={() => setHoverStar(star)}
                      onMouseLeave={() => setHoverStar(0)}
                      onClick={() => setUserRating(star)}
                      className={`text-2xl transition-colors ${
                        (hoverStar || userRating) >= star
                          ? "text-yellow-400"
                          : "text-medium-gray/30"
                      }`}
                    >
                      {(hoverStar || userRating) >= star ? "\u2605" : "\u2606"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-2 font-mono text-xs font-semibold uppercase tracking-widest text-code-green">
                  {"// Review (Optional)"}
                </h3>
                <textarea
                  value={userReview}
                  onChange={(e) => setUserReview(e.target.value)}
                  placeholder="Share your experience with this template..."
                  rows={3}
                  className="w-full border border-medium-gray/30 bg-black px-4 py-2.5 font-mono text-sm text-white outline-none placeholder:text-medium-gray/50 focus:border-code-green"
                />
              </div>
            </div>

            <div className="flex gap-3 border-t border-medium-gray/20 px-6 py-4">
              <button
                onClick={handleRate}
                disabled={!userRating || submittingRating}
                className="border border-code-green bg-code-green px-6 py-2.5 text-xs font-bold uppercase text-black transition-colors hover:bg-transparent hover:text-code-green disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {submittingRating ? "Submitting..." : "Submit Rating"}
              </button>
              <button
                onClick={() => {
                  setRatingTemplate(null);
                  setUserRating(0);
                  setUserReview("");
                }}
                className="border border-medium-gray/40 px-6 py-2.5 text-xs font-bold uppercase text-medium-gray transition-colors hover:border-white hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
