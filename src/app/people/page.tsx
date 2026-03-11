"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

type Person = {
  id: string;
  name: string;
  bio: string | null;
  image: string | null;
  location: string | null;
  skills: string[] | null;
  interests: string[] | null;
  endeavorCount: number;
  createdCount: number;
};

type PopularSkill = { skill: string; count: number };

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [popularSkills, setPopularSkills] = useState<PopularSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [sort, setSort] = useState<"active" | "newest" | "creators">("active");

  useEffect(() => {
    fetchPeople();
  }, [activeSkill, sort]);

  async function fetchPeople() {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeSkill) params.set("skill", activeSkill);
    params.set("sort", sort);

    try {
      const res = await fetch(`/api/people?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPeople(data.people);
        if (data.popularSkills.length > 0) {
          setPopularSkills(data.popularSkills);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AppHeader />
      <main id="main-content" className="mx-auto max-w-6xl px-4 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="mb-2 text-2xl font-bold">People</h1>
          <p className="text-sm text-medium-gray">
            Discover collaborators, creators, and skilled people on Endeavor
          </p>
        </div>

        {/* Sort controls */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            {(["active", "newest", "creators"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSort(s)}
                className={`border px-3 py-1.5 text-xs transition-colors ${
                  sort === s
                    ? "border-code-green text-code-green"
                    : "border-medium-gray/30 text-medium-gray hover:border-code-green/50 hover:text-code-green"
                }`}
              >
                {s === "active" ? "Most Active" : s === "newest" ? "Newest" : "Top Creators"}
              </button>
            ))}
          </div>
        </div>

        {/* Skill filter pills */}
        {popularSkills.length > 0 && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-1.5">
              {activeSkill && (
                <button
                  onClick={() => setActiveSkill(null)}
                  className="border border-red-500/30 px-2 py-1 text-xs text-red-400 transition-colors hover:border-red-500 hover:text-red-300"
                >
                  Clear filter
                </button>
              )}
              {popularSkills.slice(0, 15).map((s) => (
                <button
                  key={s.skill}
                  onClick={() =>
                    setActiveSkill(activeSkill === s.skill ? null : s.skill)
                  }
                  className={`border px-2 py-1 text-xs transition-colors ${
                    activeSkill === s.skill
                      ? "border-code-blue bg-code-blue/10 text-code-blue"
                      : "border-medium-gray/20 text-medium-gray hover:border-code-blue/50 hover:text-code-blue"
                  }`}
                >
                  {s.skill}
                </button>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="animate-pulse border border-medium-gray/20 p-5">
                <div className="mb-3 flex items-center gap-3">
                  <div className="h-10 w-10 bg-medium-gray/10" />
                  <div>
                    <div className="mb-1 h-4 w-28 bg-medium-gray/10" />
                    <div className="h-3 w-20 bg-medium-gray/10" />
                  </div>
                </div>
                <div className="h-3 w-full bg-medium-gray/10" />
              </div>
            ))}
          </div>
        ) : people.length === 0 ? (
          <div className="py-16 text-center text-medium-gray">
            <p className="mb-2">No people found</p>
            {activeSkill && (
              <button
                onClick={() => setActiveSkill(null)}
                className="text-sm text-code-blue hover:text-code-green"
              >
                Clear filter
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((person) => (
              <Link
                key={person.id}
                href={`/users/${person.id}`}
                className="group border border-medium-gray/20 p-5 transition-colors hover:border-code-blue/50"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center bg-code-blue/10 text-sm font-bold text-code-blue shrink-0">
                    {person.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate group-hover:text-code-blue transition-colors">
                      {person.name}
                    </p>
                    {person.location && (
                      <p className="text-xs text-medium-gray truncate">{person.location}</p>
                    )}
                  </div>
                </div>

                {person.bio && (
                  <p className="mb-3 text-xs text-medium-gray line-clamp-2 leading-relaxed">
                    {person.bio}
                  </p>
                )}

                {person.skills && person.skills.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1">
                    {person.skills.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className={`border px-1.5 py-0.5 text-[10px] ${
                          activeSkill && s.toLowerCase().includes(activeSkill.toLowerCase())
                            ? "border-code-green/50 text-code-green"
                            : "border-medium-gray/20 text-medium-gray"
                        }`}
                      >
                        {s}
                      </span>
                    ))}
                    {person.skills.length > 4 && (
                      <span className="text-[10px] text-medium-gray">
                        +{person.skills.length - 4}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex gap-4 text-xs text-medium-gray">
                  <span>{person.createdCount} created</span>
                  <span>{person.endeavorCount} joined</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
