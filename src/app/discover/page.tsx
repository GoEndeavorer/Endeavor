"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

type Endeavor = {
  id: string;
  title: string;
  category: string;
  status: string;
  imageUrl: string | null;
  memberCount: number;
  description: string;
  needs: string[] | null;
};

type Person = {
  id: string;
  name: string;
  bio: string | null;
  skills: string[] | null;
  endeavorCount: number;
};

export default function DiscoverPage() {
  const { data: session } = useSession();
  const [recommended, setRecommended] = useState<Endeavor[]>([]);
  const [trending, setTrending] = useState<Endeavor[]>([]);
  const [newEndeavors, setNewEndeavors] = useState<Endeavor[]>([]);
  const [activePeople, setActivePeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      session
        ? fetch("/api/endeavors/recommended").then((r) => r.ok ? r.json() : [])
        : Promise.resolve([]),
      fetch("/api/endeavors/trending").then((r) => r.ok ? r.json() : []),
      fetch("/api/endeavors?sort=newest&limit=6").then((r) => r.ok ? r.json() : []),
      fetch("/api/people?sort=active&limit=6").then((r) => r.ok ? r.json() : { users: [] }),
    ])
      .then(([rec, trend, newE, people]) => {
        setRecommended(Array.isArray(rec) ? rec : []);
        setTrending(Array.isArray(trend) ? trend : []);
        setNewEndeavors(Array.isArray(newE) ? newE : []);
        setActivePeople(Array.isArray(people.users) ? people.users : Array.isArray(people) ? people : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session]);

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Discover", href: "/discover" }} />

      <main className="mx-auto max-w-6xl px-4 pt-24 pb-16">
        <h1 className="mb-2 text-3xl font-bold">Discover</h1>
        <p className="mb-8 text-sm text-medium-gray">
          Personalized recommendations, trending projects, and active community members.
        </p>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 animate-pulse bg-medium-gray/10 border border-medium-gray/10" />
            ))}
          </div>
        ) : (
          <>
            {/* Recommended */}
            {recommended.length > 0 && (
              <section className="mb-12">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green">
                    {"// recommended for you"}
                  </h2>
                  <Link href="/feed" className="text-xs text-medium-gray hover:text-code-green">
                    View all &rarr;
                  </Link>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {recommended.slice(0, 3).map((e) => (
                    <EndeavorCard key={e.id} endeavor={e} />
                  ))}
                </div>
              </section>
            )}

            {/* Trending */}
            {trending.length > 0 && (
              <section className="mb-12">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green">
                    {"// trending"}
                  </h2>
                  <Link href="/explore" className="text-xs text-medium-gray hover:text-code-green">
                    Explore trends &rarr;
                  </Link>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {trending.slice(0, 3).map((e) => (
                    <EndeavorCard key={e.id} endeavor={e} />
                  ))}
                </div>
              </section>
            )}

            {/* New */}
            {newEndeavors.length > 0 && (
              <section className="mb-12">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green">
                    {"// just posted"}
                  </h2>
                  <Link href="/feed?sort=newest" className="text-xs text-medium-gray hover:text-code-green">
                    See more &rarr;
                  </Link>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {newEndeavors.slice(0, 3).map((e) => (
                    <EndeavorCard key={e.id} endeavor={e} />
                  ))}
                </div>
              </section>
            )}

            {/* Active people */}
            {activePeople.length > 0 && (
              <section className="mb-12">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-code-green">
                    {"// active members"}
                  </h2>
                  <Link href="/people" className="text-xs text-medium-gray hover:text-code-green">
                    Browse people &rarr;
                  </Link>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {activePeople.slice(0, 6).map((p) => (
                    <Link
                      key={p.id}
                      href={`/users/${p.id}`}
                      className="flex items-center gap-3 border border-medium-gray/20 p-4 transition-colors hover:border-code-green/30 group"
                    >
                      <div className="flex h-10 w-10 items-center justify-center bg-code-blue/10 text-sm font-bold text-code-blue shrink-0">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate group-hover:text-code-green transition-colors">
                          {p.name}
                        </p>
                        {p.skills && p.skills.length > 0 ? (
                          <p className="text-xs text-medium-gray truncate">
                            {p.skills.slice(0, 3).join(", ")}
                          </p>
                        ) : p.bio ? (
                          <p className="text-xs text-medium-gray truncate">{p.bio}</p>
                        ) : (
                          <p className="text-xs text-medium-gray">{p.endeavorCount} endeavors</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Quick links */}
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                { href: "/hiring", label: "Who's Hiring", desc: "Find skill matches" },
                { href: "/tags", label: "Browse Tags", desc: "Explore by skill" },
                { href: "/leaderboard", label: "Leaderboard", desc: "Top contributors" },
                { href: "/stories", label: "Stories", desc: "Read experiences" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="border border-medium-gray/20 p-4 text-center transition-colors hover:border-code-green/30 group"
                >
                  <p className="text-sm font-semibold group-hover:text-code-green transition-colors">
                    {link.label}
                  </p>
                  <p className="text-xs text-medium-gray mt-1">{link.desc}</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function EndeavorCard({ endeavor }: { endeavor: Endeavor }) {
  return (
    <Link
      href={`/endeavors/${endeavor.id}`}
      className="group border border-medium-gray/20 overflow-hidden transition-colors hover:border-code-green/50"
    >
      {endeavor.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={endeavor.imageUrl}
          alt=""
          className="h-32 w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="flex h-32 items-center justify-center bg-code-green/5 text-4xl font-bold text-code-green/20">
          {endeavor.title.charAt(0)}
        </div>
      )}
      <div className="p-4">
        <p className="text-sm font-semibold truncate group-hover:text-code-green transition-colors">
          {endeavor.title}
        </p>
        <p className="mt-1 text-xs text-medium-gray">
          {endeavor.category} &middot; {endeavor.memberCount} joined
        </p>
        {endeavor.needs && endeavor.needs.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {endeavor.needs.slice(0, 2).map((n) => (
              <span key={n} className="bg-white/5 px-1.5 py-0.5 text-[10px] text-light-gray">
                {n}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
