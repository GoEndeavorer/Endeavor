"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

type UserProfile = {
  id: string;
  name: string;
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
    role: string;
  }[];
};

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-medium-gray/30 bg-black/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold">Endeavor</Link>
          <Link href="/feed" className="text-sm text-code-blue hover:text-code-green">Feed</Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 pt-24 pb-16">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center bg-accent text-2xl font-bold">
            {profile.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            {profile.location && (
              <p className="text-sm text-medium-gray">{profile.location}</p>
            )}
            <p className="text-xs text-medium-gray">
              Joined {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {profile.bio && (
          <div className="mb-6">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// about"}
            </h2>
            <p className="text-sm text-light-gray">{profile.bio}</p>
          </div>
        )}

        {profile.skills && profile.skills.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// skills"}
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((s) => (
                <span key={s} className="border border-code-blue/30 px-2 py-1 text-xs text-code-blue">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.interests && profile.interests.length > 0 && (
          <div className="mb-6">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// interests"}
            </h2>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((i) => (
                <span key={i} className="border border-purple-400/30 px-2 py-1 text-xs text-purple-400">
                  {i}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.endeavors.length > 0 && (
          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// endeavors"} ({profile.endeavors.length})
            </h2>
            <div className="space-y-2">
              {profile.endeavors.map((e) => (
                <Link
                  key={e.endeavorId}
                  href={`/endeavors/${e.endeavorId}`}
                  className="flex items-center justify-between border border-medium-gray/20 p-3 transition-colors hover:border-code-green/50"
                >
                  <div>
                    <p className="text-sm font-semibold">{e.endeavorTitle}</p>
                    <p className="text-xs text-medium-gray">
                      {e.role} &middot; {e.endeavorCategory} &middot; {e.endeavorStatus}
                    </p>
                  </div>
                  <span className="text-xs text-code-blue">&rarr;</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
