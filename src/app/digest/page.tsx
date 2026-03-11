"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { formatTimeAgo } from "@/lib/time";

type DigestData = {
  weekStart: string;
  weekEnd: string;
  newEndeavorsCount: number;
  topNewEndeavors: {
    id: string;
    title: string;
    category: string;
    imageUrl: string | null;
    createdAt: string;
    memberCount: number;
  }[];
  completedMilestones: number;
  newMembers: number;
  mostActive: {
    id: string;
    title: string;
    category: string;
    imageUrl: string | null;
    activityCount: number;
  }[];
  topStories: {
    id: string;
    title: string;
    createdAt: string;
    endeavorId: string;
    endeavorTitle: string;
    authorName: string;
  }[];
};

function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${s.toLocaleDateString("en-US", opts)} - ${e.toLocaleDateString("en-US", { ...opts, year: "numeric" })}`;
}

export default function DigestPage() {
  const [data, setData] = useState<DigestData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/digest")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Weekly Digest", href: "/digest" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-10">
          <h1 className="mb-1 text-3xl font-bold">Weekly Digest</h1>
          {data && (
            <p className="text-sm text-medium-gray">
              {formatDateRange(data.weekStart, data.weekEnd)}
            </p>
          )}
          {!data && !loading && (
            <p className="text-sm text-medium-gray">
              Your weekly summary of what happened across the platform
            </p>
          )}
        </div>

        {loading ? (
          <div className="space-y-8">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse border border-medium-gray/20 p-6">
                <div className="mb-4 h-3 w-40 bg-medium-gray/10" />
                <div className="space-y-3">
                  <div className="h-3 w-full bg-medium-gray/10" />
                  <div className="h-3 w-3/4 bg-medium-gray/10" />
                  <div className="h-3 w-1/2 bg-medium-gray/10" />
                </div>
              </div>
            ))}
          </div>
        ) : !data ? (
          <div className="border border-medium-gray/20 py-20 text-center">
            <p className="text-medium-gray">Could not load the weekly digest.</p>
            <Link href="/feed" className="mt-3 inline-block text-sm text-code-green hover:underline">
              Browse endeavors &rarr;
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {/* ── This Week's Highlights ───────────────────────────── */}
            <section>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
                {"// this week's highlights"}
              </h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="border border-medium-gray/20 p-5 text-center">
                  <p className="text-3xl font-bold text-code-green">{data.newEndeavorsCount}</p>
                  <p className="mt-1 text-xs text-medium-gray">New Endeavors</p>
                </div>
                <div className="border border-medium-gray/20 p-5 text-center">
                  <p className="text-3xl font-bold text-code-blue">{data.completedMilestones}</p>
                  <p className="mt-1 text-xs text-medium-gray">Milestones Reached</p>
                </div>
                <div className="border border-medium-gray/20 p-5 text-center">
                  <p className="text-3xl font-bold text-light-gray">{data.newMembers}</p>
                  <p className="mt-1 text-xs text-medium-gray">New Members</p>
                </div>
              </div>
            </section>

            {/* ── New Endeavors ────────────────────────────────────── */}
            {data.topNewEndeavors.length > 0 && (
              <section>
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
                  {"// new endeavors"}
                </h2>
                <div className="space-y-2">
                  {data.topNewEndeavors.map((e) => (
                    <Link
                      key={e.id}
                      href={`/endeavors/${e.id}`}
                      className="flex items-center gap-4 border border-medium-gray/20 p-4 transition-colors hover:border-code-green/50"
                    >
                      {e.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={e.imageUrl}
                          alt=""
                          className="h-10 w-14 flex-shrink-0 object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-14 flex-shrink-0 items-center justify-center bg-code-green/10 text-sm font-bold text-code-green">
                          {e.title.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{e.title}</p>
                        <p className="text-xs text-medium-gray">
                          {e.category} &middot; {e.memberCount} member{e.memberCount !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <span className="flex-shrink-0 text-[10px] text-medium-gray">
                        {formatTimeAgo(e.createdAt)}
                      </span>
                    </Link>
                  ))}
                </div>
                {data.newEndeavorsCount > 5 && (
                  <Link
                    href="/feed"
                    className="mt-3 inline-block text-xs text-medium-gray hover:text-code-green"
                  >
                    View all {data.newEndeavorsCount} new endeavors &rarr;
                  </Link>
                )}
              </section>
            )}

            {/* ── Milestones Reached ──────────────────────────────── */}
            <section>
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
                {"// milestones reached"}
              </h2>
              {data.completedMilestones > 0 ? (
                <div className="border border-medium-gray/20 p-6">
                  <p className="text-sm text-light-gray">
                    <span className="text-2xl font-bold text-code-blue">{data.completedMilestones}</span>{" "}
                    milestone{data.completedMilestones !== 1 ? "s were" : " was"} completed across
                    the platform this week. Great progress!
                  </p>
                </div>
              ) : (
                <div className="border border-medium-gray/20 p-6 text-center">
                  <p className="text-sm text-medium-gray">
                    No milestones completed this week. Keep pushing!
                  </p>
                </div>
              )}
            </section>

            {/* ── Top Stories ─────────────────────────────────────── */}
            {data.topStories.length > 0 && (
              <section>
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
                  {"// top stories"}
                </h2>
                <div className="space-y-2">
                  {data.topStories.map((s) => (
                    <Link
                      key={s.id}
                      href={`/endeavors/${s.endeavorId}?tab=stories`}
                      className="block border border-medium-gray/20 p-4 transition-colors hover:border-code-blue/50"
                    >
                      <p className="text-sm font-semibold">{s.title}</p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-medium-gray">
                        <span className="text-code-blue">{s.authorName}</span>
                        <span>&middot;</span>
                        <span>{s.endeavorTitle}</span>
                        <span>&middot;</span>
                        <span>{formatTimeAgo(s.createdAt)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* ── Most Active ─────────────────────────────────────── */}
            {data.mostActive.length > 0 && (
              <section>
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
                  {"// most active"}
                </h2>
                <div className="space-y-2">
                  {data.mostActive.map((e, idx) => (
                    <Link
                      key={e.id}
                      href={`/endeavors/${e.id}`}
                      className="flex items-center gap-4 border border-medium-gray/20 p-4 transition-colors hover:border-code-green/50"
                    >
                      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center text-sm font-bold text-medium-gray">
                        #{idx + 1}
                      </span>
                      {e.imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={e.imageUrl}
                          alt=""
                          className="h-10 w-14 flex-shrink-0 object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-14 flex-shrink-0 items-center justify-center bg-code-green/10 text-sm font-bold text-code-green">
                          {e.title.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{e.title}</p>
                        <p className="text-xs text-medium-gray">{e.category}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-sm font-bold text-code-green">{e.activityCount}</p>
                        <p className="text-[10px] text-medium-gray">actions</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Empty state if truly nothing happened */}
            {data.newEndeavorsCount === 0 &&
              data.completedMilestones === 0 &&
              data.newMembers === 0 &&
              data.topStories.length === 0 &&
              data.mostActive.length === 0 && (
                <div className="border border-medium-gray/20 py-16 text-center">
                  <p className="text-sm text-medium-gray">
                    Quiet week across the platform. Check back soon!
                  </p>
                  <Link href="/feed" className="mt-3 inline-block text-xs text-code-green hover:underline">
                    Browse endeavors &rarr;
                  </Link>
                </div>
              )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
