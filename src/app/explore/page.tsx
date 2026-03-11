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

const categoryColors: Record<string, string> = {
  Adventure: "text-code-green border-code-green",
  Scientific: "text-code-blue border-code-blue",
  Creative: "text-yellow-400 border-yellow-400",
  Tech: "text-purple-400 border-purple-400",
  Cultural: "text-orange-400 border-orange-400",
  Community: "text-pink-400 border-pink-400",
};

export default function ExplorePage() {
  const [data, setData] = useState<TrendingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/trending-topics")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <AppHeader breadcrumb={{ label: "Explore", href: "/explore" }} />
      <main id="main-content" className="mx-auto max-w-6xl px-4 pt-24 pb-16">
        <h1 className="mb-2 text-2xl font-bold">Explore</h1>
        <p className="mb-8 text-sm text-medium-gray">
          Discover what&apos;s trending across the Endeavor community
        </p>

        {loading ? (
          <div className="space-y-8">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="mb-3 h-4 w-32 animate-pulse bg-medium-gray/10" />
                <div className="flex flex-wrap gap-2">
                  {[...Array(6)].map((_, j) => (
                    <div key={j} className="h-8 w-24 animate-pulse bg-medium-gray/10" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : data ? (
          <div className="space-y-10">
            {/* Categories */}
            <section>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
                Categories
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {data.categories.map((cat) => (
                  <Link
                    key={cat.category}
                    href={`/feed?category=${cat.category}`}
                    className={`flex items-center justify-between border p-4 transition-colors hover:bg-code-green/5 ${
                      categoryColors[cat.category]?.split(" ")[1] || "border-medium-gray/30"
                    }`}
                  >
                    <span className={`font-semibold ${categoryColors[cat.category]?.split(" ")[0] || "text-white"}`}>
                      {cat.category}
                    </span>
                    <span className="text-sm text-medium-gray">
                      {cat.count} active &middot; {cat.openCount} open
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            {/* In-demand skills */}
            {data.needs.length > 0 && (
              <section>
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-blue">
                  In-Demand Skills
                </h2>
                <p className="mb-3 text-xs text-medium-gray">
                  Skills and resources that endeavors are actively looking for
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.needs.map((n) => (
                    <Link
                      key={n.need}
                      href={`/hiring?skill=${encodeURIComponent(n.need)}`}
                      className="flex items-center gap-2 border border-code-blue/30 px-3 py-1.5 text-sm text-code-blue transition-colors hover:bg-code-blue/10"
                    >
                      <span>{n.need}</span>
                      <span className="text-xs text-medium-gray">{n.count}</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Popular skills */}
            {data.skills.length > 0 && (
              <section>
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-purple-400">
                  Community Skills
                </h2>
                <p className="mb-3 text-xs text-medium-gray">
                  Top skills across Endeavor members
                </p>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((s) => (
                    <Link
                      key={s.skill}
                      href={`/people?skill=${encodeURIComponent(s.skill)}`}
                      className="border border-purple-400/30 px-3 py-1.5 text-sm text-purple-400 transition-colors hover:bg-purple-400/10"
                    >
                      {s.skill} ({s.count})
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Popular interests */}
            {data.interests.length > 0 && (
              <section>
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-orange-400">
                  Trending Interests
                </h2>
                <div className="flex flex-wrap gap-2">
                  {data.interests.map((i) => (
                    <span
                      key={i.interest}
                      className="border border-orange-400/20 px-3 py-1.5 text-sm text-orange-400"
                    >
                      {i.interest} ({i.count})
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Locations */}
            {data.locations.length > 0 && (
              <section>
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
                  Active Locations
                </h2>
                <div className="flex flex-wrap gap-2">
                  {data.locations.map((l) => (
                    <Link
                      key={l.location}
                      href={`/feed?search=${encodeURIComponent(l.location!)}`}
                      className="border border-code-green/20 px-3 py-1.5 text-sm text-code-green transition-colors hover:bg-code-green/10"
                    >
                      {l.location} ({l.count})
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Quick links */}
            <section className="border-t border-medium-gray/20 pt-8">
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/feed"
                  className="border border-code-green bg-code-green px-6 py-3 text-sm font-bold uppercase text-black transition-colors hover:bg-transparent hover:text-code-green"
                >
                  Browse All
                </Link>
                <Link
                  href="/hiring"
                  className="border border-code-blue/50 px-6 py-3 text-sm font-bold uppercase text-code-blue transition-colors hover:bg-code-blue hover:text-black"
                >
                  Who&apos;s Hiring
                </Link>
                <Link
                  href="/people"
                  className="border border-purple-400/50 px-6 py-3 text-sm font-bold uppercase text-purple-400 transition-colors hover:bg-purple-400 hover:text-black"
                >
                  Find People
                </Link>
                <Link
                  href="/stories"
                  className="border border-medium-gray/50 px-6 py-3 text-sm font-bold uppercase text-medium-gray transition-colors hover:border-code-green hover:text-code-green"
                >
                  Read Stories
                </Link>
              </div>
            </section>
          </div>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
