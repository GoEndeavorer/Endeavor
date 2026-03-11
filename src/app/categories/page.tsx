"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { NotificationBell } from "@/components/notification-bell";

type CategoryCount = {
  category: string;
  count: number;
};

type Stats = {
  categories: CategoryCount[];
  totalEndeavors: number;
  totalUsers: number;
  totalMembers: number;
};

const categoryDescriptions: Record<string, string> = {
  Adventure: "Expeditions, treks, outdoor challenges, and travel experiences",
  Scientific: "Research projects, experiments, field studies, and discoveries",
  Creative: "Art, film, music, writing, and other creative collaborations",
  Tech: "Software, hardware, hackathons, and technology projects",
  Cultural: "Events, festivals, heritage preservation, and cultural exchanges",
  Community: "Local initiatives, volunteering, meetups, and community building",
};

const categoryColors: Record<string, { border: string; text: string; bg: string }> = {
  Adventure: { border: "border-code-green", text: "text-code-green", bg: "bg-code-green" },
  Scientific: { border: "border-code-blue", text: "text-code-blue", bg: "bg-code-blue" },
  Creative: { border: "border-yellow-400", text: "text-yellow-400", bg: "bg-yellow-400" },
  Tech: { border: "border-purple-400", text: "text-purple-400", bg: "bg-purple-400" },
  Cultural: { border: "border-orange-400", text: "text-orange-400", bg: "bg-orange-400" },
  Community: { border: "border-pink-400", text: "text-pink-400", bg: "bg-pink-400" },
};

export default function CategoriesPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/endeavors/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  const allCategories = Object.keys(categoryDescriptions);
  const countMap = new Map(
    stats?.categories.map((c) => [c.category, c.count]) || []
  );

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-medium-gray/30 bg-black/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold">
            Endeavor
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/feed" className="text-sm text-code-blue hover:text-code-green">
              Explore
            </Link>
            {session && (
              <>
                <NotificationBell />
                <Link href="/profile" className="text-sm text-code-blue hover:text-code-green">
                  Profile
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <h1 className="mb-2 text-3xl font-bold">Browse by Category</h1>
        <p className="mb-8 text-sm text-medium-gray">
          Find endeavors that match your interests and skills.
        </p>

        {/* Stats bar */}
        {stats && (
          <div className="mb-8 grid grid-cols-3 gap-4">
            <div className="border border-medium-gray/30 p-4 text-center">
              <p className="text-2xl font-bold text-code-green">{stats.totalEndeavors}</p>
              <p className="text-xs text-medium-gray">Endeavors</p>
            </div>
            <div className="border border-medium-gray/30 p-4 text-center">
              <p className="text-2xl font-bold text-code-blue">{stats.totalUsers}</p>
              <p className="text-xs text-medium-gray">Users</p>
            </div>
            <div className="border border-medium-gray/30 p-4 text-center">
              <p className="text-2xl font-bold text-purple-400">{stats.totalMembers}</p>
              <p className="text-xs text-medium-gray">Collaborations</p>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {allCategories.map((cat) => {
            const colors = categoryColors[cat];
            const count = countMap.get(cat) || 0;
            return (
              <Link
                key={cat}
                href={`/feed?category=${cat}`}
                className={`group border ${colors.border}/30 p-6 transition-colors hover:${colors.border}`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <h2 className={`text-lg font-bold ${colors.text}`}>{cat}</h2>
                  <span className="text-sm text-medium-gray">
                    {count} active
                  </span>
                </div>
                <p className="text-sm text-light-gray">
                  {categoryDescriptions[cat]}
                </p>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
