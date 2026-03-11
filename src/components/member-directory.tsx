"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatTimeAgo } from "@/lib/time";

type Member = {
  user_id: string;
  name: string;
  image: string | null;
  bio: string | null;
  skills: string[] | null;
  location: string | null;
  role: string;
  joined_at: string;
  discussion_count: number;
  tasks_completed: number;
  xp: number;
  level: number;
  title: string;
};

const roleColors: Record<string, string> = {
  creator: "text-yellow-400 border-yellow-400/30",
  admin: "text-purple-400 border-purple-400/30",
  moderator: "text-code-blue border-code-blue/30",
  collaborator: "text-code-green border-code-green/30",
};

export function MemberDirectory({ endeavorId }: { endeavorId: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"role" | "xp" | "activity">("role");

  useEffect(() => {
    fetch(`/api/endeavors/${endeavorId}/members/directory${search ? `?q=${encodeURIComponent(search)}` : ""}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setMembers)
      .finally(() => setLoading(false));
  }, [endeavorId, search]);

  const sorted = [...members].sort((a, b) => {
    if (sortBy === "xp") return b.xp - a.xp;
    if (sortBy === "activity") return (b.discussion_count + b.tasks_completed) - (a.discussion_count + a.tasks_completed);
    return 0; // default role order from API
  });

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search members..."
          className="flex-1 border border-medium-gray/30 bg-black px-3 py-2 text-sm text-white placeholder:text-medium-gray"
        />
        <div className="flex gap-1">
          {(["role", "xp", "activity"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-2 py-1 text-xs transition-colors ${
                sortBy === s
                  ? "text-code-green bg-code-green/10"
                  : "text-medium-gray hover:text-white"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-medium-gray">Loading...</p>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-medium-gray">No members found.</p>
      ) : (
        <div className="space-y-2">
          {sorted.map((m) => (
            <Link
              key={m.user_id}
              href={`/users/${m.user_id}`}
              className="flex items-start gap-3 border border-medium-gray/20 p-3 transition-colors hover:border-code-green/30 group"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-code-green/10 border border-code-green/30 text-sm font-bold text-code-green">
                {m.image ? (
                  <img src={m.image} alt={m.name} className="h-full w-full object-cover" />
                ) : (
                  m.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold group-hover:text-code-green transition-colors truncate">
                    {m.name}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 border ${roleColors[m.role] || "text-medium-gray border-medium-gray/30"}`}>
                    {m.role}
                  </span>
                  <span className="text-xs text-code-green">Lv.{m.level}</span>
                </div>
                {m.bio && (
                  <p className="text-xs text-medium-gray line-clamp-1 mt-0.5">{m.bio}</p>
                )}
                <div className="flex items-center gap-3 mt-1 text-xs text-medium-gray">
                  {m.location && <span>{m.location}</span>}
                  <span>{m.discussion_count} posts</span>
                  <span>{m.tasks_completed} tasks done</span>
                  <span>joined {formatTimeAgo(m.joined_at)}</span>
                </div>
                {m.skills && m.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {m.skills.slice(0, 4).map((s) => (
                      <span key={s} className="text-xs px-1 py-0.5 border border-code-blue/20 text-code-blue">
                        {s}
                      </span>
                    ))}
                    {m.skills.length > 4 && (
                      <span className="text-xs text-medium-gray">+{m.skills.length - 4}</span>
                    )}
                  </div>
                )}
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs font-mono text-medium-gray">{m.xp.toLocaleString()} XP</p>
                <p className="text-xs text-code-green">{m.title}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
