"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { formatTimeAgo } from "@/lib/time";

type FeedItem = {
  type: string;
  title: string;
  actorName: string;
  actorId: string;
  endeavorId: string | null;
  endeavorTitle: string | null;
  createdAt: string;
};

const typeConfig: Record<string, { icon: string; label: string; color: string }> = {
  new_endeavor: { icon: "+", label: "created an endeavor", color: "text-code-green" },
  discussion: { icon: "?", label: "started a discussion", color: "text-code-blue" },
  milestone: { icon: "!", label: "milestone reached", color: "text-yellow-400" },
  story: { icon: ">", label: "published a story", color: "text-purple-400" },
  member_joined: { icon: "*", label: "joined an endeavor", color: "text-orange-400" },
};

function FeedItemSkeleton() {
  return (
    <div className="flex gap-4 border border-medium-gray/20 p-4 animate-pulse">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-medium-gray/20" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 bg-medium-gray/20" />
        <div className="h-3 w-1/2 bg-medium-gray/10" />
      </div>
      <div className="h-3 w-12 bg-medium-gray/10 shrink-0" />
    </div>
  );
}

export default function FollowingPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [isPending, session, router]);

  // Fetch feed
  useEffect(() => {
    if (!session) return;

    setLoading(true);
    fetch("/api/feed/following")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        setItems(data);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [session]);

  if (isPending) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Following", href: "/following" }} />
        <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <FeedItemSkeleton key={i} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Following", href: "/following" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Following</h1>
          <p className="mt-1 text-sm text-medium-gray">
            Activity from people you follow and endeavors you watch.
          </p>
        </div>

        <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
          {"// recent activity"}
        </h2>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <FeedItemSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="border border-red-400/30 p-8 text-center">
            <p className="text-sm text-red-400">Failed to load your feed.</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 border border-red-400 px-4 py-2 text-xs font-bold uppercase text-red-400 transition-colors hover:bg-red-400 hover:text-black"
            >
              Retry
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="border border-medium-gray/20 p-12 text-center">
            <p className="mb-2 text-lg text-medium-gray">
              Your feed is empty.
            </p>
            <p className="mb-6 text-sm text-medium-gray">
              Follow people or bookmark endeavors to see their activity here.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/people"
                className="border border-code-green px-6 py-3 text-xs font-bold uppercase text-code-green transition-colors hover:bg-code-green hover:text-black"
              >
                Find People
              </Link>
              <Link
                href="/feed"
                className="border border-code-blue px-6 py-3 text-xs font-bold uppercase text-code-blue transition-colors hover:bg-code-blue hover:text-black"
              >
                Explore Endeavors
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, i) => {
              const config = typeConfig[item.type] || {
                icon: "-",
                label: "activity",
                color: "text-light-gray",
              };

              return (
                <div
                  key={`${item.type}-${item.actorId}-${item.createdAt}-${i}`}
                  className="flex items-start gap-4 border border-medium-gray/20 p-4 transition-colors hover:border-medium-gray/40"
                >
                  {/* Type icon */}
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center border border-medium-gray/30 font-mono text-sm font-bold ${config.color}`}
                  >
                    {config.icon}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <Link
                        href={`/users/${item.actorId}`}
                        className="font-semibold text-code-blue hover:text-code-green transition-colors"
                      >
                        {item.actorName}
                      </Link>{" "}
                      <span className="text-medium-gray">{config.label}</span>
                    </p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-light-gray">
                      {item.endeavorId ? (
                        <Link
                          href={`/endeavors/${item.endeavorId}`}
                          className="hover:text-code-green transition-colors"
                        >
                          {item.title}
                        </Link>
                      ) : (
                        item.title
                      )}
                    </p>
                    {item.endeavorTitle && item.endeavorTitle !== item.title && (
                      <p className="mt-0.5 text-xs text-medium-gray">
                        in{" "}
                        <Link
                          href={`/endeavors/${item.endeavorId}`}
                          className="text-code-blue hover:text-code-green transition-colors"
                        >
                          {item.endeavorTitle}
                        </Link>
                      </p>
                    )}
                  </div>

                  {/* Timestamp */}
                  <span className="shrink-0 text-xs text-medium-gray">
                    {formatTimeAgo(item.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
