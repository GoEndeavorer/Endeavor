"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { formatTimeAgo } from "@/lib/time";

type HiringEndeavor = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string | null;
  locationType: string;
  needs: string[];
  status: string;
  imageUrl: string | null;
  capacity: number | null;
  joinType: string;
  creatorName: string;
  createdAt: string;
  memberCount: number;
};

export default function HiringPage() {
  const [endeavors, setEndeavors] = useState<HiringEndeavor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNeed, setSelectedNeed] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/endeavors/hiring")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEndeavors(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Collect all unique needs for filtering
  const allNeeds = Array.from(
    new Set(endeavors.flatMap((e) => e.needs))
  ).sort();

  const filtered = selectedNeed
    ? endeavors.filter((e) => e.needs.includes(selectedNeed))
    : endeavors;

  const categoryColors: Record<string, string> = {
    Scientific: "text-code-blue",
    Tech: "text-purple-400",
    Creative: "text-yellow-400",
    Adventure: "text-code-green",
    Cultural: "text-orange-400",
    Community: "text-pink-400",
  };

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Who's Hiring", href: "/hiring" }} />

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">
            Who&apos;s Hiring
          </h1>
          <p className="text-sm text-medium-gray">
            Endeavors actively looking for people with specific skills and resources.
            Find one that needs what you have.
          </p>
        </div>

        {/* Skill filter pills */}
        {allNeeds.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedNeed(null)}
                className={`border px-3 py-1.5 text-xs font-semibold uppercase transition-colors ${
                  !selectedNeed
                    ? "border-code-green bg-code-green text-black"
                    : "border-medium-gray/50 text-medium-gray hover:border-code-green hover:text-code-green"
                }`}
              >
                All ({endeavors.length})
              </button>
              {allNeeds.slice(0, 15).map((need) => {
                const count = endeavors.filter((e) =>
                  e.needs.includes(need)
                ).length;
                return (
                  <button
                    key={need}
                    onClick={() =>
                      setSelectedNeed(selectedNeed === need ? null : need)
                    }
                    className={`border px-3 py-1.5 text-xs transition-colors ${
                      selectedNeed === need
                        ? "border-code-green bg-code-green text-black font-semibold"
                        : "border-medium-gray/30 text-light-gray hover:border-code-green hover:text-code-green"
                    }`}
                  >
                    {need} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-32 w-full animate-pulse bg-medium-gray/10"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="border border-medium-gray/20 p-12 text-center">
            <p className="mb-4 text-medium-gray">
              {selectedNeed
                ? `No endeavors currently need "${selectedNeed}".`
                : "No endeavors are actively hiring right now."}
            </p>
            <Link
              href="/feed"
              className="text-code-blue hover:text-code-green"
            >
              Browse all endeavors &rarr;
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((e) => (
              <Link
                key={e.id}
                href={`/endeavors/${e.id}`}
                className="group flex gap-4 border border-medium-gray/30 p-5 transition-colors hover:border-code-green/50"
              >
                {e.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={e.imageUrl}
                    alt=""
                    className="h-24 w-32 flex-shrink-0 object-cover"
                    loading="lazy"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="font-bold truncate group-hover:text-code-green transition-colors">
                      {e.title}
                    </h3>
                    <span
                      className={`text-xs font-semibold ${
                        categoryColors[e.category] || "text-medium-gray"
                      }`}
                    >
                      {e.category}
                    </span>
                  </div>
                  <p className="mb-2 text-sm text-light-gray line-clamp-2">
                    {e.description}
                  </p>
                  <div className="mb-2 flex flex-wrap gap-1.5">
                    {e.needs.map((need) => (
                      <span
                        key={need}
                        className={`border px-2 py-0.5 text-xs ${
                          selectedNeed === need
                            ? "border-code-green bg-code-green/10 text-code-green"
                            : "border-medium-gray/30 text-light-gray"
                        }`}
                      >
                        {need}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-medium-gray">
                    <span>by {e.creatorName}</span>
                    <span>&middot;</span>
                    <span>{e.memberCount} joined</span>
                    {e.capacity && (
                      <>
                        <span>&middot;</span>
                        <span>
                          {e.capacity - e.memberCount} spots left
                        </span>
                      </>
                    )}
                    {e.location && (
                      <>
                        <span>&middot;</span>
                        <span>{e.location}</span>
                      </>
                    )}
                    <span>&middot;</span>
                    <span>{formatTimeAgo(e.createdAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
