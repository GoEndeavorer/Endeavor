"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { formatTimeAgo } from "@/lib/time";

type Endorsement = {
  id: string;
  message: string;
  createdAt: string;
  endeavorId: string;
  endeavorTitle: string;
  endorserId: string;
  endorserName: string;
  endorserImage: string | null;
};

export default function EndorsementsPage() {
  const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/endorsements/wall")
      .then((r) => r.json())
      .then(setEndorsements)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <AppHeader
        breadcrumb={{ label: "Endorsement Wall", href: "/endorsements" }}
      />

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <h1 className="mb-2 font-mono text-3xl font-bold">Endorsement Wall</h1>
        <p className="mb-8 text-sm text-medium-gray">
          What collaborators are saying about the endeavors they have been part
          of.
        </p>

        {loading ? (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="mb-4 break-inside-avoid animate-pulse border border-medium-gray/20 p-5"
              >
                <div className="mb-3 h-4 w-3/4 bg-medium-gray/10" />
                <div className="mb-2 h-3 w-full bg-medium-gray/10" />
                <div className="mb-4 h-3 w-2/3 bg-medium-gray/10" />
                <div className="h-3 w-1/2 bg-medium-gray/10" />
              </div>
            ))}
          </div>
        ) : endorsements.length === 0 ? (
          <p className="py-16 text-center text-sm text-medium-gray">
            No endorsements yet. Be the first to endorse an endeavor you have
            joined.
          </p>
        ) : (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {endorsements.map((e) => (
              <div
                key={e.id}
                className="mb-4 break-inside-avoid border border-medium-gray/20 p-5 transition-colors hover:border-code-green/40"
              >
                <p className="mb-4 font-mono text-sm leading-relaxed text-light-gray">
                  &quot;{e.message}&quot;
                </p>

                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center bg-accent text-xs font-bold">
                    {e.endorserName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/users/${e.endorserId}`}
                      className="block truncate text-sm font-semibold transition-colors hover:text-code-green"
                    >
                      {e.endorserName}
                    </Link>
                    <Link
                      href={`/endeavors/${e.endeavorId}`}
                      className="block truncate text-xs text-code-blue transition-colors hover:text-code-green"
                    >
                      {e.endeavorTitle}
                    </Link>
                  </div>
                </div>

                <p className="mt-3 text-right font-mono text-xs text-medium-gray">
                  {formatTimeAgo(e.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
