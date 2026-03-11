"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { formatTimeAgo } from "@/lib/time";

type DigestData = {
  newEndeavors: { id: string; title: string; category: string; createdAt: string }[];
  memberUpdates: { endeavorId: string; endeavorTitle: string; userName: string; joinedAt: string }[];
  milestoneUpdates: { endeavorId: string; endeavorTitle: string; title: string; completedAt: string }[];
  weeklyStats: { discussions: number; tasksCompleted: number };
};

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
    <>
      <AppHeader breadcrumb={{ label: "Weekly Digest", href: "/digest" }} />
      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <h1 className="mb-2 text-2xl font-bold">Weekly Digest</h1>
        <p className="mb-8 text-sm text-medium-gray">
          Your personalized summary of the past 7 days
        </p>

        {loading ? (
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse border border-medium-gray/20 p-6">
                <div className="mb-3 h-3 w-32 bg-medium-gray/10" />
                <div className="space-y-2">
                  <div className="h-3 w-full bg-medium-gray/10" />
                  <div className="h-3 w-3/4 bg-medium-gray/10" />
                </div>
              </div>
            ))}
          </div>
        ) : !data ? (
          <div className="py-16 text-center">
            <p className="text-medium-gray">Log in to see your digest.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Weekly stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border border-medium-gray/20 p-4 text-center">
                <p className="text-2xl font-bold text-code-green">{data.weeklyStats.discussions}</p>
                <p className="text-xs text-medium-gray">Discussions this week</p>
              </div>
              <div className="border border-medium-gray/20 p-4 text-center">
                <p className="text-2xl font-bold text-code-blue">{data.weeklyStats.tasksCompleted}</p>
                <p className="text-xs text-medium-gray">Tasks completed</p>
              </div>
            </div>

            {/* New endeavors */}
            {data.newEndeavors.length > 0 && (
              <div>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
                  {"// new endeavors in your interests"}
                </h2>
                <div className="space-y-2">
                  {data.newEndeavors.map((e) => (
                    <Link
                      key={e.id}
                      href={`/endeavors/${e.id}`}
                      className="flex items-center justify-between border border-medium-gray/20 p-3 transition-colors hover:border-code-green/50"
                    >
                      <div>
                        <p className="text-sm font-semibold">{e.title}</p>
                        <p className="text-xs text-medium-gray">{e.category}</p>
                      </div>
                      <span className="text-[10px] text-medium-gray">
                        {formatTimeAgo(e.createdAt)}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* New members */}
            {data.memberUpdates.length > 0 && (
              <div>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-blue">
                  {"// new members joined"}
                </h2>
                <div className="space-y-2">
                  {data.memberUpdates.map((m, i) => (
                    <div key={i} className="border border-medium-gray/20 p-3">
                      <p className="text-sm">
                        <span className="font-semibold text-code-blue">{m.userName}</span>{" "}
                        joined{" "}
                        <Link href={`/endeavors/${m.endeavorId}`} className="text-code-green hover:underline">
                          {m.endeavorTitle}
                        </Link>
                      </p>
                      <p className="text-[10px] text-medium-gray">{formatTimeAgo(m.joinedAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Milestone completions */}
            {data.milestoneUpdates.length > 0 && (
              <div>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-purple-400">
                  {"// milestones completed"}
                </h2>
                <div className="space-y-2">
                  {data.milestoneUpdates.map((m, i) => (
                    <div key={i} className="border border-medium-gray/20 p-3">
                      <p className="text-sm">
                        <span className="font-semibold text-purple-400">{m.title}</span>{" "}
                        in{" "}
                        <Link href={`/endeavors/${m.endeavorId}`} className="text-code-green hover:underline">
                          {m.endeavorTitle}
                        </Link>
                      </p>
                      <p className="text-[10px] text-medium-gray">{formatTimeAgo(m.completedAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.newEndeavors.length === 0 && data.memberUpdates.length === 0 && data.milestoneUpdates.length === 0 && (
              <div className="py-12 text-center text-medium-gray">
                <p className="text-sm">Quiet week! Check back later for updates.</p>
                <Link href="/feed" className="mt-2 inline-block text-xs text-code-green hover:underline">
                  Browse endeavors &rarr;
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
