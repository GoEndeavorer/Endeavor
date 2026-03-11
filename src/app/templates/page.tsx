"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

type EndeavorTemplate = {
  id: string;
  name: string;
  description: string;
  category: string;
  suggestedNeeds: string[];
  suggestedMilestones: string[];
  suggestedTasks: string[];
};

const CATEGORY_COLORS: Record<string, string> = {
  Technology: "text-code-green border-code-green",
  Education: "text-code-blue border-code-blue",
  Sports: "text-yellow-400 border-yellow-400",
  Community: "text-purple-400 border-purple-400",
  Travel: "text-orange-400 border-orange-400",
};

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<EndeavorTemplate[]>([]);
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
              comes with suggested needs, milestones, and tasks.
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse border border-medium-gray/30 p-6"
                >
                  <div className="mb-3 h-4 w-24 bg-medium-gray/20" />
                  <div className="mb-2 h-6 w-3/4 bg-medium-gray/20" />
                  <div className="mb-4 h-16 w-full bg-medium-gray/20" />
                  <div className="h-8 w-32 bg-medium-gray/20" />
                </div>
              ))}
            </div>
          )}

          {/* Grid */}
          {!loading && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => {
                const colorClass =
                  CATEGORY_COLORS[template.category] ||
                  "text-medium-gray border-medium-gray";

                return (
                  <div
                    key={template.id}
                    className="group border border-medium-gray/30 p-6 transition-colors hover:border-code-green/50"
                  >
                    {/* Category badge */}
                    <span
                      className={`mb-3 inline-block border px-2 py-0.5 text-xs uppercase tracking-widest ${colorClass}`}
                    >
                      {template.category}
                    </span>

                    {/* Name */}
                    <h2 className="mb-2 text-lg font-bold text-white">
                      {template.name}
                    </h2>

                    {/* Description */}
                    <p className="mb-4 text-sm leading-relaxed text-medium-gray">
                      {template.description}
                    </p>

                    {/* Stats */}
                    <div className="mb-4 flex gap-4 text-xs text-medium-gray">
                      <span>
                        <span className="text-code-green font-semibold">
                          {template.suggestedNeeds.length}
                        </span>{" "}
                        needs
                      </span>
                      <span>
                        <span className="text-code-blue font-semibold">
                          {template.suggestedMilestones.length}
                        </span>{" "}
                        milestones
                      </span>
                      <span>
                        <span className="text-white font-semibold">
                          {template.suggestedTasks.length}
                        </span>{" "}
                        tasks
                      </span>
                    </div>

                    {/* Needs preview */}
                    <div className="mb-5 flex flex-wrap gap-1.5">
                      {template.suggestedNeeds.slice(0, 4).map((need) => (
                        <span
                          key={need}
                          className="bg-code-green/10 px-2 py-0.5 text-xs text-code-green"
                        >
                          {need}
                        </span>
                      ))}
                      {template.suggestedNeeds.length > 4 && (
                        <span className="px-2 py-0.5 text-xs text-medium-gray">
                          +{template.suggestedNeeds.length - 4} more
                        </span>
                      )}
                    </div>

                    {/* CTA */}
                    <Link
                      href={`/endeavors/create?template=${template.id}`}
                      className="inline-block border border-code-green bg-code-green px-4 py-2 text-xs font-bold uppercase text-black transition-colors hover:bg-transparent hover:text-code-green"
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
