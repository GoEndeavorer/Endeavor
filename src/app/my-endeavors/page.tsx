"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { formatTimeAgo } from "@/lib/time";

type Endeavor = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  imageUrl: string | null;
  memberCount: number;
  creatorId: string;
  createdAt: string;
};

export default function MyEndeavorsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [endeavors, setEndeavors] = useState<Endeavor[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all" | "created" | "joined">("all");

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    fetch("/api/endeavors?mine=true")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEndeavors(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session]);

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center text-medium-gray">
        Loading...
      </div>
    );
  }

  const created = endeavors.filter((e) => e.creatorId === session.user.id);
  const joined = endeavors.filter((e) => e.creatorId !== session.user.id);
  const filtered =
    tab === "created" ? created : tab === "joined" ? joined : endeavors;

  const statusColors: Record<string, string> = {
    open: "text-code-green",
    "in-progress": "text-code-blue",
    completed: "text-purple-400",
    cancelled: "text-red-400",
    draft: "text-medium-gray",
  };

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "My Endeavors", href: "/my-endeavors" }} />

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <h1 className="mb-6 text-3xl font-bold">My Endeavors</h1>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          {[
            { id: "all" as const, label: "All", count: endeavors.length },
            { id: "created" as const, label: "Created", count: created.length },
            { id: "joined" as const, label: "Joined", count: joined.length },
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
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center text-medium-gray">
            Loading your endeavors...
          </div>
        ) : filtered.length === 0 ? (
          <div className="border border-medium-gray/30 p-8 text-center">
            <p className="mb-4 text-medium-gray">
              {tab === "created"
                ? "You haven't created any endeavors yet."
                : tab === "joined"
                ? "You haven't joined any endeavors yet."
                : "No endeavors to show."}
            </p>
            <div className="flex justify-center gap-3">
              <Link
                href="/endeavors/create"
                className="border border-code-green px-4 py-2 text-xs font-bold uppercase text-code-green transition-colors hover:bg-code-green hover:text-black"
              >
                Create One
              </Link>
              <Link
                href="/feed"
                className="border border-code-blue px-4 py-2 text-xs font-bold uppercase text-code-blue transition-colors hover:bg-code-blue hover:text-black"
              >
                Explore
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((e) => (
              <Link
                key={e.id}
                href={`/endeavors/${e.id}`}
                className="group flex items-center gap-4 border border-medium-gray/30 p-4 transition-colors hover:border-code-green/50"
              >
                {e.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={e.imageUrl}
                    alt=""
                    className="h-16 w-24 flex-shrink-0 object-cover"
                    loading="lazy"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold truncate">{e.title}</h3>
                    <span className={`text-xs font-semibold ${statusColors[e.status] || "text-medium-gray"}`}>
                      {e.status === "in-progress" ? "In Progress" :
                       e.status.charAt(0).toUpperCase() + e.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-xs text-medium-gray">
                    {e.category} &middot; {e.memberCount} members &middot; {formatTimeAgo(e.createdAt)}
                    {e.creatorId === session.user.id ? " · Creator" : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/endeavors/${e.id}/dashboard`}
                    onClick={(ev) => ev.stopPropagation()}
                    className="border border-code-blue px-3 py-1.5 text-xs font-semibold text-code-blue transition-colors hover:bg-code-blue hover:text-black"
                  >
                    Dashboard
                  </Link>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
