"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

type TrendingSkill = {
  skill: string;
  count: number;
};

export default function SkillsPage() {
  const [skills, setSkills] = useState<TrendingSkill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/skills/trending")
      .then((res) => res.json())
      .then((data) => {
        setSkills(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const maxCount = skills.length > 0 ? skills[0].count : 1;

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <AppHeader />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: "#00FF00" }}>
            &gt; trending_skills
          </h1>
          <p className="mt-2 text-sm" style={{ color: "#666666" }}>
            Most popular skills across the platform. Click a skill to find
            people and endeavors.
          </p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-10 rounded animate-pulse"
                style={{ backgroundColor: "#111" }}
              />
            ))}
          </div>
        ) : skills.length === 0 ? (
          <div
            className="text-center py-16 text-sm"
            style={{ color: "#666666" }}
          >
            No skills found yet. Users can add skills to their profiles.
          </div>
        ) : (
          <div className="space-y-2">
            {skills.map((item, index) => {
              const barWidth = Math.max(
                (item.count / maxCount) * 100,
                8
              );
              return (
                <Link
                  key={item.skill}
                  href={`/search?q=${encodeURIComponent(item.skill)}`}
                  className="group flex items-center gap-4 py-2 px-3 rounded transition-colors hover:bg-white/5"
                >
                  <span
                    className="w-6 text-right text-xs font-mono"
                    style={{ color: "#666666" }}
                  >
                    {index + 1}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className="font-mono text-sm truncate group-hover:underline"
                        style={{ color: "#00FF00" }}
                      >
                        {item.skill}
                      </span>
                      <span
                        className="text-xs font-mono ml-3 shrink-0"
                        style={{ color: "#00A1D6" }}
                      >
                        {item.count} {item.count === 1 ? "user" : "users"}
                      </span>
                    </div>

                    <div
                      className="h-1 rounded-full overflow-hidden"
                      style={{ backgroundColor: "#1a1a1a" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${barWidth}%`,
                          backgroundColor: "#00FF00",
                          opacity: 0.6,
                        }}
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div
          className="mt-12 pt-8 border-t text-xs font-mono"
          style={{ borderColor: "#222", color: "#666666" }}
        >
          <p>
            Skills are sourced from user profiles. Add skills to your profile to
            appear in trending results.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
