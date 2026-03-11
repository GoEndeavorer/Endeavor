"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

export const dynamic = "force-dynamic";

type Template = {
  id: string;
  name: string;
  description: string;
  category: string;
  suggestedNeeds: string[];
  suggestedMilestones: string[];
  icon: string;
  locationType: string;
  suggestedCapacity: number;
};

const CATEGORY_COLORS: Record<string, string> = {
  Scientific: "border-code-blue text-code-blue",
  Tech: "border-purple-400 text-purple-400",
  Creative: "border-yellow-400 text-yellow-400",
  Adventure: "border-code-green text-code-green",
  Cultural: "border-orange-400 text-orange-400",
  Community: "border-pink-400 text-pink-400",
};

const CATEGORY_BG: Record<string, string> = {
  Scientific: "bg-code-blue/10",
  Tech: "bg-purple-400/10",
  Creative: "bg-yellow-400/10",
  Adventure: "bg-code-green/10",
  Cultural: "bg-orange-400/10",
  Community: "bg-pink-400/10",
};

const LOCATION_LABELS: Record<string, string> = {
  "in-person": "In-Person",
  remote: "Remote",
  either: "In-Person / Remote",
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

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  useEffect(() => {
    fetch("/api/templates")
      .then((res) => res.json())
      .then((data: Template[]) => {
        setTemplates(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(templates.map((t) => t.category))),
    [templates]
  );

  const filtered = useMemo(() => {
    return templates.filter((t) => {
      const matchesCategory = !activeCategory || t.category === activeCategory;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.suggestedNeeds.some((n) => n.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [templates, activeCategory, search]);

  return (
    <>
      <AppHeader breadcrumb={{ label: "Templates", href: "/templates" }} />

      <main className="min-h-screen bg-black pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-4">
          {/* Header */}
          <div className="mb-10">
            <h1 className="mb-2 text-3xl font-bold">
              <span className="text-code-green">{">"}</span> Endeavor Templates
            </h1>
            <p className="max-w-xl text-medium-gray">
              Jump-start your next endeavor with a curated template. Each comes
              with suggested needs, milestones, and capacity to get you moving
              fast.
            </p>
          </div>

          {/* Search + Filter Bar */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-code-green">
                $
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="search templates..."
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
              {categories.map((cat) => {
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
            <p className="mb-4 font-mono text-xs text-medium-gray">
              {filtered.length} template{filtered.length !== 1 ? "s" : ""}{" "}
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
          {!loading && filtered.length === 0 && (
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

          {/* Template grid */}
          {!loading && filtered.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((template) => {
                const colorClass =
                  CATEGORY_COLORS[template.category] ||
                  "border-medium-gray text-medium-gray";
                const bgClass =
                  CATEGORY_BG[template.category] || "bg-medium-gray/10";

                return (
                  <div
                    key={template.id}
                    className="group flex flex-col border border-medium-gray/20 bg-white/[0.02] transition-all hover:border-code-green/40 hover:bg-white/[0.04]"
                  >
                    {/* Icon + Category header */}
                    <div className="flex items-start gap-3 p-6 pb-0">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center font-mono text-sm font-bold ${bgClass} ${colorClass} border`}
                      >
                        {ICON_MAP[template.icon] || "?"}
                      </div>
                      <div className="min-w-0">
                        <div className="mb-1 flex items-center gap-2">
                          <span
                            className={`border px-2 py-0.5 text-[10px] uppercase tracking-widest ${colorClass}`}
                          >
                            {template.category}
                          </span>
                          <span className="text-[10px] text-medium-gray">
                            {LOCATION_LABELS[template.locationType] ||
                              template.locationType}
                          </span>
                        </div>
                        <h2 className="text-lg font-bold leading-tight text-white">
                          {template.name}
                        </h2>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="flex flex-1 flex-col p-6 pt-3">
                      <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-medium-gray">
                        {template.description}
                      </p>

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

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link
                          href={`/endeavors/create?template=${template.id}`}
                          className="inline-block border border-code-green bg-code-green px-4 py-2 text-xs font-bold uppercase text-black transition-colors hover:bg-transparent hover:text-code-green"
                        >
                          Use Template
                        </Link>
                        <button
                          onClick={() => setPreviewTemplate(template)}
                          className="border border-medium-gray/40 px-4 py-2 text-xs font-bold uppercase text-medium-gray transition-colors hover:border-white hover:text-white"
                        >
                          Preview
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
                    CATEGORY_BG[previewTemplate.category] ||
                    "bg-medium-gray/10"
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
                    <span>
                      {previewTemplate.suggestedCapacity} spots
                    </span>
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
              {/* Description */}
              <div>
                <h3 className="mb-2 font-mono text-xs font-semibold uppercase tracking-widest text-code-green">
                  // Description
                </h3>
                <p className="text-sm leading-relaxed text-neutral-300">
                  {previewTemplate.description}
                </p>
              </div>

              {/* Suggested Needs */}
              <div>
                <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-code-green">
                  // Suggested Needs
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

              {/* Suggested Milestones */}
              <div>
                <h3 className="mb-3 font-mono text-xs font-semibold uppercase tracking-widest text-code-green">
                  // Milestones
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
            </div>

            {/* Modal footer */}
            <div className="sticky bottom-0 flex gap-3 border-t border-medium-gray/20 bg-neutral-950 px-6 py-4">
              <Link
                href={`/endeavors/create?template=${previewTemplate.id}`}
                className="border border-code-green bg-code-green px-6 py-2.5 text-xs font-bold uppercase text-black transition-colors hover:bg-transparent hover:text-code-green"
              >
                Use This Template
              </Link>
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

      <Footer />
    </>
  );
}
