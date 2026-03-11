"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

export const dynamic = "force-dynamic";

type Template = {
  id: string;
  title: string;
  description: string;
  category: string;
  needs: string[];
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

const LOCATION_LABELS: Record<string, string> = {
  "in-person": "In-Person",
  remote: "Remote",
  either: "In-Person / Remote",
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/templates")
      .then((res) => res.json())
      .then((data) => {
        setTemplates(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <AppHeader breadcrumb={{ label: "Templates", href: "/templates" }} />

      <main className="min-h-screen bg-black pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-4">
          {/* Header */}
          <div className="mb-12">
            <h1 className="mb-2 text-3xl font-bold">
              <span className="text-code-green">{">"}</span> Endeavor Templates
            </h1>
            <p className="text-medium-gray">
              Jump-start your next endeavor with a pre-built template. Each
              comes with suggested needs and capacity.
            </p>
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse border border-medium-gray/30 p-6"
                >
                  <div className="mb-3 h-4 w-24 bg-medium-gray/20" />
                  <div className="mb-2 h-6 w-3/4 bg-medium-gray/20" />
                  <div className="mb-4 h-12 w-full bg-medium-gray/20" />
                  <div className="mb-4 flex gap-2">
                    <div className="h-5 w-16 bg-medium-gray/20" />
                    <div className="h-5 w-20 bg-medium-gray/20" />
                    <div className="h-5 w-14 bg-medium-gray/20" />
                  </div>
                  <div className="h-8 w-32 bg-medium-gray/20" />
                </div>
              ))}
            </div>
          )}

          {/* Template grid */}
          {!loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => {
                const colorClass =
                  CATEGORY_COLORS[template.category] ||
                  "border-medium-gray text-medium-gray";

                return (
                  <div
                    key={template.id}
                    className="group flex flex-col border border-medium-gray/30 p-6 transition-colors hover:border-code-green/50"
                  >
                    {/* Category badge + location */}
                    <div className="mb-3 flex items-center gap-2">
                      <span
                        className={`border px-2 py-0.5 text-xs uppercase tracking-widest ${colorClass}`}
                      >
                        {template.category}
                      </span>
                      <span className="text-xs text-medium-gray">
                        {LOCATION_LABELS[template.locationType] ||
                          template.locationType}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className="mb-2 text-lg font-bold text-white">
                      {template.title}
                    </h2>

                    {/* Description */}
                    <p className="mb-4 text-sm leading-relaxed text-medium-gray">
                      {template.description}
                    </p>

                    {/* Needs as tags */}
                    <div className="mb-4 flex flex-wrap gap-1.5">
                      {template.needs.map((need) => (
                        <span
                          key={need}
                          className="bg-white/5 px-2 py-0.5 text-xs text-light-gray"
                        >
                          {need}
                        </span>
                      ))}
                    </div>

                    {/* Capacity */}
                    <div className="mb-5 mt-auto text-xs text-medium-gray">
                      <span className="text-code-green font-semibold">
                        {template.suggestedCapacity}
                      </span>{" "}
                      suggested spots
                    </div>

                    {/* CTA */}
                    <Link
                      href={`/endeavors/create?template=${template.id}`}
                      className="inline-block self-start border border-code-green bg-code-green px-4 py-2 text-xs font-bold uppercase text-black transition-colors hover:bg-transparent hover:text-code-green"
                    >
                      Use Template
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
