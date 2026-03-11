"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

type LeaderboardUser = {
  id: string;
  name: string;
  image: string | null;
  count: number;
};

type ActiveUser = {
  id: string;
  name: string;
  image: string | null;
  tasks: number;
  stories: number;
  discussions: number;
};

type LeaderboardData = {
  topCreators: LeaderboardUser[];
  topContributors: LeaderboardUser[];
  mostActive: ActiveUser[];
};

export default function LeaderboardPage() {
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"creators" | "contributors" | "active">("creators");

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Leaderboard", href: "/leaderboard" }} />

      <main className="mx-auto max-w-2xl px-4 pt-24 pb-16">
        <h1 className="mb-2 text-3xl font-bold">Leaderboard</h1>
        <p className="mb-6 text-sm text-medium-gray">
          Top contributors building and shaping the Endeavor community.
        </p>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          {[
            { id: "creators" as const, label: "Top Creators" },
            { id: "contributors" as const, label: "Top Contributors" },
            { id: "active" as const, label: "Most Active" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`border px-4 py-2 text-xs font-semibold uppercase transition-colors ${
                tab === t.id
                  ? "border-code-green bg-code-green text-black"
                  : "border-medium-gray/50 text-medium-gray hover:border-code-green hover:text-code-green"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="h-14 w-full animate-pulse bg-medium-gray/10" />
            ))}
          </div>
        ) : !data ? (
          <p className="text-sm text-medium-gray">Failed to load leaderboard.</p>
        ) : (
          <>
            {tab === "creators" && (
              <RankList
                users={data.topCreators}
                label="endeavors created"
                color="text-code-green"
              />
            )}
            {tab === "contributors" && (
              <RankList
                users={data.topContributors}
                label="endeavors joined"
                color="text-code-blue"
              />
            )}
            {tab === "active" && (
              <div className="space-y-2">
                {data.mostActive.length === 0 ? (
                  <p className="py-8 text-center text-sm text-medium-gray">
                    No activity yet.
                  </p>
                ) : (
                  data.mostActive.map((u, i) => (
                    <Link
                      key={u.id}
                      href={`/users/${u.id}`}
                      className="flex items-center gap-4 border border-medium-gray/20 p-4 transition-colors hover:border-code-green/50 group"
                    >
                      <span className="w-6 text-center text-sm font-bold text-medium-gray">
                        {i + 1}
                      </span>
                      <div className="flex h-10 w-10 items-center justify-center bg-accent text-sm font-bold">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate group-hover:text-code-green transition-colors">
                          {u.name}
                        </p>
                        <div className="flex gap-3 text-xs text-medium-gray">
                          {u.tasks > 0 && (
                            <span className="text-code-green">
                              {u.tasks} tasks done
                            </span>
                          )}
                          {u.stories > 0 && (
                            <span className="text-purple-400">
                              {u.stories} stories
                            </span>
                          )}
                          {u.discussions > 0 && (
                            <span className="text-code-blue">
                              {u.discussions} messages
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-lg font-bold text-code-green">
                        {u.tasks + u.stories + u.discussions}
                      </span>
                    </Link>
                  ))
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

function RankList({
  users,
  label,
  color,
}: {
  users: LeaderboardUser[];
  label: string;
  color: string;
}) {
  if (users.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-medium-gray">
        No data yet.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {users.map((u, i) => (
        <Link
          key={u.id}
          href={`/users/${u.id}`}
          className="flex items-center gap-4 border border-medium-gray/20 p-4 transition-colors hover:border-code-green/50 group"
        >
          <span
            className={`w-6 text-center text-sm font-bold ${
              i === 0
                ? "text-yellow-400"
                : i === 1
                ? "text-light-gray"
                : i === 2
                ? "text-orange-400"
                : "text-medium-gray"
            }`}
          >
            {i + 1}
          </span>
          <div className="flex h-10 w-10 items-center justify-center bg-accent text-sm font-bold">
            {u.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate group-hover:text-code-green transition-colors">
              {u.name}
            </p>
            <p className="text-xs text-medium-gray">
              {u.count} {label}
            </p>
          </div>
          <span className={`text-lg font-bold ${color}`}>{u.count}</span>
        </Link>
      ))}
    </div>
  );
}
