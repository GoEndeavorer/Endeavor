"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

type MapEndeavor = {
  id: string;
  title: string;
  category: string;
  location: string;
  locationType: string;
  status: string;
  imageUrl: string | null;
  memberCount: number;
};

export default function MapPage() {
  const [endeavors, setEndeavors] = useState<MapEndeavor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetch("/api/endeavors/map")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setEndeavors(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(endeavors.map((e) => e.category));
    return ["all", ...Array.from(cats).sort()];
  }, [endeavors]);

  // Group by location
  const locationGroups = useMemo(() => {
    const groups: Record<string, MapEndeavor[]> = {};
    endeavors
      .filter((e) => {
        if (selectedCategory !== "all" && e.category !== selectedCategory) return false;
        if (filter && !e.location.toLowerCase().includes(filter.toLowerCase()) &&
            !e.title.toLowerCase().includes(filter.toLowerCase())) return false;
        return true;
      })
      .forEach((e) => {
        const loc = e.location;
        if (!groups[loc]) groups[loc] = [];
        groups[loc].push(e);
      });
    return Object.entries(groups).sort(([, a], [, b]) => b.length - a.length);
  }, [endeavors, filter, selectedCategory]);

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Map", href: "/map" }} />

      <main className="mx-auto max-w-6xl px-4 pt-24 pb-16">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Endeavor Map</h1>
            <p className="text-sm text-medium-gray">
              {endeavors.length} endeavors across {locationGroups.length} locations
            </p>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search locations..."
              className="border border-medium-gray/30 bg-transparent px-3 py-2 text-sm text-white placeholder:text-medium-gray/50 focus:border-code-green focus:outline-none"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white focus:border-code-green focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse bg-medium-gray/10 border border-medium-gray/10" />
            ))}
          </div>
        ) : locationGroups.length === 0 ? (
          <div className="border border-medium-gray/20 p-12 text-center">
            <p className="text-2xl mb-2">{"{ }"}</p>
            <p className="text-sm text-medium-gray">
              No location-based endeavors found.
            </p>
            <Link href="/feed" className="mt-3 inline-block text-xs text-code-green hover:underline">
              Browse all endeavors
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {locationGroups.map(([location, items]) => (
              <div key={location} className="border border-medium-gray/20">
                <div className="flex items-center justify-between border-b border-medium-gray/20 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center border border-code-green/30 text-xs font-bold text-code-green">
                      {items.length}
                    </span>
                    <div>
                      <h2 className="font-semibold">{location}</h2>
                      <p className="text-xs text-medium-gray">
                        {items.reduce((sum, e) => sum + Number(e.memberCount), 0)} total members
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {Array.from(new Set(items.map((e) => e.locationType))).map((lt) => (
                      <span
                        key={lt}
                        className={`px-2 py-0.5 text-[10px] border ${
                          lt === "in-person"
                            ? "border-code-green/30 text-code-green"
                            : lt === "remote"
                              ? "border-code-blue/30 text-code-blue"
                              : "border-purple-400/30 text-purple-400"
                        }`}
                      >
                        {lt}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="grid gap-px bg-medium-gray/10 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((e) => (
                    <Link
                      key={e.id}
                      href={`/endeavors/${e.id}`}
                      className="group bg-black p-4 transition-colors hover:bg-white/[0.02]"
                    >
                      <div className="flex items-start gap-3">
                        {e.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={e.imageUrl}
                            alt=""
                            className="h-10 w-10 shrink-0 object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-code-green/5 text-sm font-bold text-code-green/30">
                            {e.title.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold group-hover:text-code-green transition-colors">
                            {e.title}
                          </p>
                          <p className="text-xs text-medium-gray">
                            {e.category} &middot; {e.memberCount} members
                          </p>
                          <span
                            className={`mt-1 inline-block text-[10px] ${
                              e.status === "open"
                                ? "text-code-green"
                                : e.status === "in-progress"
                                  ? "text-code-blue"
                                  : "text-medium-gray"
                            }`}
                          >
                            {e.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
