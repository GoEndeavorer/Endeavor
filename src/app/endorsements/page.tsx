"use client";

import { useState, useEffect } from "react";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { formatTimeAgo } from "@/lib/time";

type Endorsement = {
  id: string;
  endeavor_id: string;
  author_id: string;
  content: string;
  rating: number;
  created_at: string;
  from_name: string;
  from_image: string | null;
  to_name: string;
};

export default function EndorsementsPage() {
  const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/endorsements/recent")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setEndorsements(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      <AppHeader
        breadcrumb={{ label: "Endorsements", href: "/endorsements" }}
      />

      <main className="mx-auto max-w-5xl px-4 pt-24 pb-16">
        <p className="mb-6 font-mono text-sm text-code-green">
          {"// endorsement wall"}
        </p>

        {loading ? (
          <p className="py-16 text-center font-mono text-xs text-medium-gray">
            Loading...
          </p>
        ) : endorsements.length === 0 ? (
          <p className="py-16 text-center font-mono text-xs text-medium-gray">
            No endorsements yet. Be the first to endorse someone!
          </p>
        ) : (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {endorsements.map((e) => (
              <div
                key={e.id}
                className="mb-4 break-inside-avoid border border-medium-gray/20 p-4 transition-colors hover:border-code-green/40"
              >
                <div className="mb-3 flex items-center gap-2">
                  {e.from_image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={e.from_image}
                      alt=""
                      className="h-6 w-6 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center bg-accent font-mono text-[10px] font-bold">
                      {e.from_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="truncate font-mono text-xs font-semibold">
                    {e.from_name}
                  </span>
                </div>

                <p className="mb-2 font-mono text-xs text-medium-gray">
                  endorsed{" "}
                  <span className="text-code-blue">{e.to_name}</span>
                </p>

                <p className="mb-2 font-mono text-xs text-code-green">
                  {"★".repeat(e.rating)}
                  {"☆".repeat(5 - e.rating)}
                </p>

                {e.content && (
                  <p className="mb-3 font-mono text-xs leading-relaxed text-light-gray">
                    &quot;{e.content}&quot;
                  </p>
                )}

                <p className="text-right font-mono text-[10px] text-medium-gray">
                  {formatTimeAgo(e.created_at)}
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
