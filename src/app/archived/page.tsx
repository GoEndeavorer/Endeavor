"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { formatTimeAgo } from "@/lib/time";

type Endeavor = {
  id: string;
  title: string;
  category: string;
  status: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function ArchivedPage() {
  const { data: session } = useSession();
  const [endeavors, setEndeavors] = useState<Endeavor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    fetch("/api/endeavors?mine=true")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        setEndeavors(data.filter((e: Endeavor) => e.status === "cancelled"));
      })
      .finally(() => setLoading(false));
  }, [session]);

  return (
    <>
      <AppHeader breadcrumb={{ label: "Archived", href: "/archived" }} />
      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <h1 className="mb-6 text-2xl font-bold">Archived Endeavors</h1>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse border border-medium-gray/20 p-4">
                <div className="h-4 w-48 bg-medium-gray/10 mb-2" />
                <div className="h-3 w-32 bg-medium-gray/10" />
              </div>
            ))}
          </div>
        ) : endeavors.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-medium-gray">No archived endeavors.</p>
            <Link href="/my-endeavors" className="mt-2 inline-block text-sm text-code-green hover:underline">
              View your endeavors &rarr;
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {endeavors.map((e) => (
              <Link
                key={e.id}
                href={`/endeavors/${e.id}`}
                className="flex items-center gap-4 border border-medium-gray/20 p-4 transition-colors hover:border-code-green/30 opacity-70 hover:opacity-100"
              >
                {e.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={e.imageUrl} alt="" className="h-12 w-16 object-cover shrink-0 grayscale" />
                ) : (
                  <div className="flex h-12 w-16 items-center justify-center bg-medium-gray/10 shrink-0 text-lg font-bold text-medium-gray">
                    {e.title.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{e.title}</p>
                  <p className="text-xs text-medium-gray">
                    {e.category} &middot; Archived {formatTimeAgo(e.updatedAt)}
                  </p>
                </div>
                <span className="text-xs text-medium-gray border border-medium-gray/30 px-2 py-0.5">
                  archived
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
