"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

type TrendingData = {
  categories: { category: string; count: number; openCount: number }[];
  needs: { need: string; count: number }[];
  skills: { skill: string; count: number }[];
  interests: { interest: string; count: number }[];
  locations: { location: string; count: number }[];
};

function TagCloud({
  items,
  baseHref,
  paramName,
  color,
}: {
  items: { label: string; count: number }[];
  baseHref: string;
  paramName: string;
  color: string;
}) {
  const max = Math.max(...items.map((i) => i.count), 1);
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const scale = 0.7 + (item.count / max) * 0.6;
        return (
          <Link
            key={item.label}
            href={`${baseHref}?${paramName}=${encodeURIComponent(item.label)}`}
            className={`border border-${color}/20 px-3 py-1.5 text-${color} hover:bg-${color}/10 transition-colors`}
            style={{ fontSize: `${scale}rem` }}
          >
            {item.label}
            <span className="ml-1.5 text-medium-gray text-xs">
              {item.count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

export default function TrendingPage() {
  const [data, setData] = useState<TrendingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "categories" | "needs" | "skills" | "locations"
  >("categories");

  useEffect(() => {
    fetch("/api/trending-topics")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const tabs = [
    { id: "categories" as const, label: "Categories" },
    { id: "needs" as const, label: "In Demand" },
    { id: "skills" as const, label: "Top Skills" },
    { id: "locations" as const, label: "Locations" },
  ];

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Trending", href: "/trending" }} />

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <h1 className="mb-2 text-2xl font-bold">Trending Topics</h1>
        <p className="mb-8 text-sm text-medium-gray">
          What the community is building, seeking, and where they are
        </p>

        {/* Tabs */}
        <div className="mb-8 flex gap-1 border-b border-medium-gray/20">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
                activeTab === tab.id
                  ? "border-b-2 border-code-green text-code-green"
                  : "text-medium-gray hover:text-light-gray"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-12 animate-pulse bg-medium-gray/10 border border-medium-gray/10"
              />
            ))}
          </div>
        ) : !data ? (
          <div className="border border-medium-gray/20 p-12 text-center">
            <p className="text-sm text-medium-gray">
              Failed to load trending data
            </p>
          </div>
        ) : (
          <>
            {activeTab === "categories" && (
              <div>
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
                  {"// active categories"}
                </p>
                <div className="space-y-2">
                  {data.categories
                    .sort((a, b) => b.count - a.count)
                    .map((cat) => {
                      const pct =
                        data.categories.length > 0
                          ? Math.round(
                              (cat.count /
                                Math.max(
                                  ...data.categories.map((c) => c.count)
                                )) *
                                100
                            )
                          : 0;
                      return (
                        <Link
                          key={cat.category}
                          href={`/feed?category=${encodeURIComponent(cat.category)}`}
                          className="group flex items-center border border-medium-gray/20 p-4 transition-colors hover:border-code-green/30"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-semibold group-hover:text-code-green transition-colors">
                              {cat.category}
                            </p>
                            <p className="text-xs text-medium-gray mt-0.5">
                              {cat.count} endeavor
                              {cat.count !== 1 ? "s" : ""} &middot;{" "}
                              {cat.openCount} open
                            </p>
                          </div>
                          <div className="w-32 h-2 bg-medium-gray/10 ml-4">
                            <div
                              className="h-full bg-code-green/40 transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </Link>
                      );
                    })}
                </div>
              </div>
            )}

            {activeTab === "needs" && (
              <div>
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
                  {"// skills in demand"}
                </p>
                {data.needs.length === 0 ? (
                  <p className="text-sm text-medium-gray text-center py-8">
                    No needs data available yet
                  </p>
                ) : (
                  <TagCloud
                    items={data.needs.map((n) => ({
                      label: n.need,
                      count: n.count,
                    }))}
                    baseHref="/feed"
                    paramName="search"
                    color="code-blue"
                  />
                )}
              </div>
            )}

            {activeTab === "skills" && (
              <div>
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
                  {"// community skills"}
                </p>
                {data.skills.length === 0 ? (
                  <p className="text-sm text-medium-gray text-center py-8">
                    No skills data available yet
                  </p>
                ) : (
                  <TagCloud
                    items={data.skills.map((s) => ({
                      label: s.skill,
                      count: s.count,
                    }))}
                    baseHref="/people"
                    paramName="skill"
                    color="code-green"
                  />
                )}

                {data.interests.length > 0 && (
                  <div className="mt-8">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
                      {"// popular interests"}
                    </p>
                    <TagCloud
                      items={data.interests.map((i) => ({
                        label: i.interest,
                        count: i.count,
                      }))}
                      baseHref="/people"
                      paramName="interest"
                      color="purple-400"
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === "locations" && (
              <div>
                <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
                  {"// location hotspots"}
                </p>
                {data.locations.length === 0 ? (
                  <p className="text-sm text-medium-gray text-center py-8">
                    No location data available yet
                  </p>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {data.locations.map((loc) => (
                      <Link
                        key={loc.location}
                        href={`/feed?search=${encodeURIComponent(loc.location)}`}
                        className="group flex items-center justify-between border border-medium-gray/20 p-4 transition-colors hover:border-code-green/30"
                      >
                        <span className="text-sm group-hover:text-code-green transition-colors">
                          {loc.location}
                        </span>
                        <span className="text-xs text-medium-gray">
                          {loc.count} endeavor{loc.count !== 1 ? "s" : ""}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
