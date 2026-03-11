"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

type NeedData = {
  need: string;
  count: number;
  endeavors: { id: string; title: string; category: string; status: string }[];
};

export default function NeedsPage() {
  const [needs, setNeeds] = useState<NeedData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/needs")
      .then((r) => (r.ok ? r.json() : []))
      .then(setNeeds)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <AppHeader breadcrumb={{ label: "Browse by Need", href: "/needs" }} />
      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        <h1 className="mb-2 text-2xl font-bold">Browse by Need</h1>
        <p className="mb-8 text-sm text-medium-gray">
          Find endeavors that need specific skills or resources
        </p>

        {loading ? (
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse border border-medium-gray/20 p-4">
                <div className="h-4 w-32 bg-medium-gray/10" />
              </div>
            ))}
          </div>
        ) : needs.length === 0 ? (
          <div className="py-16 text-center text-medium-gray">
            <p>No needs listed yet.</p>
            <Link href="/feed" className="mt-2 inline-block text-sm text-code-green hover:underline">
              Explore endeavors &rarr;
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {needs.map((n) => (
              <div key={n.need} className="border border-medium-gray/20">
                <button
                  onClick={() => setExpanded(expanded === n.need ? null : n.need)}
                  className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-medium-gray/5"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{n.need}</span>
                    <span className="bg-code-green/10 px-2 py-0.5 text-[10px] font-bold text-code-green">
                      {n.count}
                    </span>
                  </div>
                  <span className="text-xs text-medium-gray">
                    {expanded === n.need ? "−" : "+"}
                  </span>
                </button>
                {expanded === n.need && (
                  <div className="border-t border-medium-gray/10 p-4 space-y-2">
                    {n.endeavors.map((e) => (
                      <Link
                        key={e.id}
                        href={`/endeavors/${e.id}`}
                        className="flex items-center justify-between text-sm hover:text-code-green transition-colors"
                      >
                        <span className="truncate">{e.title}</span>
                        <span className="shrink-0 text-xs text-medium-gray">{e.category}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
