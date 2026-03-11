"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { formatTimeAgo } from "@/lib/time";

type FeedItem = {
  type: "endeavor" | "update" | "story";
  id: string;
  title: string;
  detail: string | null;
  endeavorId: string | null;
  endeavorTitle: string | null;
  userId: string;
  imageUrl: string | null;
  createdAt: string;
};

const typeLabels: Record<string, string> = {
  endeavor: "New Endeavor",
  update: "Posted Update",
  story: "Published Story",
};

const typeColors: Record<string, string> = {
  endeavor: "text-code-green",
  update: "text-code-blue",
  story: "text-purple-400",
};

const typeIcons: Record<string, string> = {
  endeavor: "+",
  update: "!",
  story: "*",
};

export default function FollowingPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/feed")
        .then((r) => (r.ok ? r.json() : []))
        .then(setItems)
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center text-medium-gray">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Following", href: "/following" }} />

      <main className="mx-auto max-w-2xl px-4 pt-24 pb-16">
        <h1 className="mb-6 text-xl font-bold">Following Feed</h1>

        {loading ? (
          <p className="text-sm text-medium-gray">Loading...</p>
        ) : items.length === 0 ? (
          <div className="border border-medium-gray/20 p-12 text-center">
            <p className="mb-2 text-medium-gray">No activity from people you follow.</p>
            <p className="mb-6 text-xs text-medium-gray">
              Follow users to see their endeavors, updates, and stories here.
            </p>
            <Link
              href="/feed"
              className="border border-code-green px-6 py-3 text-xs font-bold uppercase text-code-green transition-colors hover:bg-code-green hover:text-black"
            >
              Explore Endeavors
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const icon = typeIcons[item.type] || ">";
              const color = typeColors[item.type] || "text-medium-gray";
              const label = typeLabels[item.type] || item.type;

              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className="border border-medium-gray/20 p-4 transition-colors hover:border-code-green/30"
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-0.5 text-sm font-mono font-bold ${color}`}>
                      {icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold uppercase ${color}`}>
                          {label}
                        </span>
                        <span className="text-xs text-medium-gray">
                          {formatTimeAgo(new Date(item.createdAt))}
                        </span>
                      </div>
                      <Link
                        href={item.endeavorId ? `/endeavors/${item.endeavorId}` : "#"}
                        className="text-sm font-semibold hover:text-code-green transition-colors"
                      >
                        {item.title}
                      </Link>
                      {item.detail && (
                        <p className="mt-1 text-xs text-medium-gray line-clamp-2">
                          {item.detail}
                        </p>
                      )}
                      {item.endeavorTitle && item.type !== "endeavor" && (
                        <Link
                          href={`/endeavors/${item.endeavorId}`}
                          className="mt-1 block text-xs text-code-blue hover:text-code-green"
                        >
                          in {item.endeavorTitle}
                        </Link>
                      )}
                    </div>
                    {item.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt=""
                        className="h-12 w-16 flex-shrink-0 object-cover"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
