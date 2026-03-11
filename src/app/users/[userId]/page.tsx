"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";

type UserProfile = {
  id: string;
  name: string;
  image: string | null;
  bio: string | null;
  location: string | null;
  skills: string[] | null;
  interests: string[] | null;
  createdAt: string;
  endeavors: {
    endeavorId: string;
    endeavorTitle: string;
    endeavorCategory: string;
    endeavorStatus: string;
    endeavorImage: string | null;
    role: string;
  }[];
  stats: {
    endeavorsJoined: number;
    endeavorsCreated: number;
    endeavorsCompleted: number;
    tasksCompleted: number;
    tasksTotal: number;
    storiesPublished: number;
    discussions: number;
  };
};

const statusColors: Record<string, string> = {
  open: "text-code-green border-code-green/30",
  "in-progress": "text-code-blue border-code-blue/30",
  completed: "text-purple-400 border-purple-400/30",
  draft: "text-medium-gray border-medium-gray/30",
  cancelled: "text-red-400 border-red-400/30",
};

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"endeavors" | "created">("endeavors");

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setProfile(data))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-medium-gray">
        Loading...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-medium-gray">User not found.</p>
      </div>
    );
  }

  const joinedEndeavors = profile.endeavors.filter((e) => e.role !== "creator");
  const createdEndeavors = profile.endeavors.filter((e) => e.role === "creator");
  const displayEndeavors = tab === "created" ? createdEndeavors : joinedEndeavors;
  const memberSince = new Date(profile.createdAt);
  const daysSince = Math.floor((Date.now() - memberSince.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: profile.name, href: `/users/${userId}` }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        {/* Profile header */}
        <div className="mb-8 flex items-start gap-5">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center bg-code-green/10 border border-code-green/30 text-3xl font-bold text-code-green">
            {profile.image ? (
              <img src={profile.image} alt={profile.name} className="h-full w-full object-cover" />
            ) : (
              profile.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold truncate">{profile.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-medium-gray">
              {profile.location && (
                <span>{profile.location}</span>
              )}
              <span>
                Joined {memberSince.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </span>
              {daysSince > 0 && (
                <span className="text-xs">({daysSince}d ago)</span>
              )}
            </div>
            {profile.bio && (
              <p className="mt-2 text-sm text-light-gray leading-relaxed">{profile.bio}</p>
            )}
          </div>
        </div>

        {/* Stats grid */}
        <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard label="Endeavors" value={profile.stats.endeavorsJoined} />
          <StatCard label="Created" value={profile.stats.endeavorsCreated} />
          <StatCard label="Completed" value={profile.stats.endeavorsCompleted} />
          <StatCard label="Tasks Done" value={profile.stats.tasksCompleted} />
        </div>

        {/* Activity summary */}
        {(profile.stats.storiesPublished > 0 || profile.stats.discussions > 0) && (
          <div className="mb-8 flex gap-4 text-xs text-medium-gray">
            {profile.stats.storiesPublished > 0 && (
              <span>{profile.stats.storiesPublished} {profile.stats.storiesPublished === 1 ? "story" : "stories"} published</span>
            )}
            {profile.stats.discussions > 0 && (
              <span>{profile.stats.discussions} discussion {profile.stats.discussions === 1 ? "message" : "messages"}</span>
            )}
          </div>
        )}

        {/* Skills & Interests */}
        <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {profile.skills && profile.skills.length > 0 && (
            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-code-green">
                {"// skills"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((s) => (
                  <span key={s} className="border border-code-blue/30 bg-code-blue/5 px-2 py-1 text-xs text-code-blue">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {profile.interests && profile.interests.length > 0 && (
            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-code-green">
                {"// interests"}
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((i) => (
                  <span key={i} className="border border-purple-400/30 bg-purple-400/5 px-2 py-1 text-xs text-purple-400">
                    {i}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Endeavors */}
        {profile.endeavors.length > 0 && (
          <div>
            <div className="mb-4 flex items-center gap-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green">
                {"// endeavors"}
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setTab("endeavors")}
                  className={`px-3 py-1 text-xs transition-colors ${
                    tab === "endeavors"
                      ? "bg-code-green/10 text-code-green border border-code-green/30"
                      : "text-medium-gray hover:text-white"
                  }`}
                >
                  Joined ({joinedEndeavors.length})
                </button>
                <button
                  onClick={() => setTab("created")}
                  className={`px-3 py-1 text-xs transition-colors ${
                    tab === "created"
                      ? "bg-code-green/10 text-code-green border border-code-green/30"
                      : "text-medium-gray hover:text-white"
                  }`}
                >
                  Created ({createdEndeavors.length})
                </button>
              </div>
            </div>

            {displayEndeavors.length === 0 ? (
              <p className="text-sm text-medium-gray py-4">
                No {tab === "created" ? "created" : "joined"} endeavors yet.
              </p>
            ) : (
              <div className="space-y-2">
                {displayEndeavors.map((e) => (
                  <Link
                    key={e.endeavorId}
                    href={`/endeavors/${e.endeavorId}`}
                    className="flex items-center gap-3 border border-medium-gray/20 p-3 transition-colors hover:border-code-green/50 group"
                  >
                    {e.endeavorImage && (
                      <img
                        src={e.endeavorImage}
                        alt=""
                        className="h-10 w-14 object-cover shrink-0"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate group-hover:text-code-green transition-colors">
                        {e.endeavorTitle}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-medium-gray">{e.endeavorCategory}</span>
                        <span className={`text-xs px-1.5 py-0.5 border ${statusColors[e.endeavorStatus] || "text-medium-gray border-medium-gray/30"}`}>
                          {e.endeavorStatus}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-code-blue opacity-0 group-hover:opacity-100 transition-opacity">&rarr;</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {profile.endeavors.length === 0 && (
          <div className="text-center py-12 text-medium-gray">
            <p className="text-sm">This user hasn&apos;t joined any endeavors yet.</p>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="border border-medium-gray/20 p-3 text-center">
      <p className="text-xl font-bold text-code-green">{value}</p>
      <p className="text-xs text-medium-gray mt-1">{label}</p>
    </div>
  );
}
