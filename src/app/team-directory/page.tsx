"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

type Member = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: string;
  endeavor_count: string;
  membership_count: string;
  total_xp: string;
};

const SORT_OPTIONS = [
  { key: "name", label: "Name" },
  { key: "xp", label: "XP" },
  { key: "projects", label: "Projects" },
  { key: "recent", label: "Newest" },
];

export default function TeamDirectoryPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    params.set("sort", sort);
    fetch(`/api/team-directory?${params}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setMembers)
      .finally(() => setLoading(false));
  }, [debouncedSearch, sort]);

  function getLevel(xp: number) {
    return Math.floor(Math.sqrt(xp / 50)) + 1;
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Team Directory", href: "/team-directory" }} />

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Team Directory</h1>
          <p className="text-sm text-medium-gray">Browse community members</p>
        </div>

        {/* Search and Sort */}
        <div className="flex gap-4 mb-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="flex-1 border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
          />
          <div className="flex gap-1">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSort(opt.key)}
                className={`px-3 py-2 text-xs font-semibold transition-colors ${
                  sort === opt.key ? "bg-code-green text-black" : "border border-medium-gray/30 text-medium-gray hover:text-light-gray"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-medium-gray">Loading...</p>
        ) : members.length === 0 ? (
          <div className="border border-medium-gray/20 p-8 text-center">
            <p className="text-sm text-medium-gray">No members found</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => {
              const xp = Number(member.total_xp);
              const level = getLevel(xp);
              return (
                <Link
                  key={member.id}
                  href={`/users/${member.id}`}
                  className="border border-medium-gray/20 p-4 hover:border-code-green/30 transition-colors group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    {member.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={member.image} alt="" className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-code-green/20 flex items-center justify-center text-sm font-bold text-code-green">
                        {member.name?.charAt(0) || "?"}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-light-gray group-hover:text-code-green transition-colors">{member.name}</p>
                      <p className="text-xs text-medium-gray">Level {level}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-medium-gray">
                    <span>{member.endeavor_count} created</span>
                    <span>{member.membership_count} joined</span>
                    <span className="text-code-green">{xp.toLocaleString()} XP</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
