"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

type CompareEndeavor = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  locationType: string;
  location: string | null;
  capacity: number | null;
  costPerPerson: number | null;
  fundingEnabled: boolean;
  fundingGoal: number | null;
  fundingRaised: number;
  memberCount: number;
  taskCount: number;
  completedTaskCount: number;
  imageUrl: string | null;
};

export default function ComparePage() {
  const [endeavors, setEndeavors] = useState<CompareEndeavor[]>([]);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<{ id: string; title: string }[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (search.length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(search)}`)
        .then((r) => (r.ok ? r.json() : { endeavors: [] }))
        .then((data) => setResults(data.endeavors || []));
    }, 200);
    return () => clearTimeout(t);
  }, [search]);

  const selectEndeavor = useCallback(
    async (id: string) => {
      if (endeavors.length >= 3) return;
      if (endeavors.some((e) => e.id === id)) return;
      setLoading(id);
      try {
        const res = await fetch(`/api/endeavors/${id}`);
        if (res.ok) {
          const data = await res.json();
          setEndeavors((prev) => [...prev, data]);
        }
      } finally {
        setLoading(null);
        setShowResults(false);
        setSearch("");
      }
    },
    [endeavors]
  );

  const removeEndeavor = (id: string) => {
    setEndeavors((prev) => prev.filter((e) => e.id !== id));
  };

  const completionRate = (e: CompareEndeavor) => {
    if (e.taskCount === 0) return "No tasks";
    const pct = Math.round((e.completedTaskCount / e.taskCount) * 100);
    return `${pct}% (${e.completedTaskCount}/${e.taskCount})`;
  };

  const rows: { label: string; getValue: (e: CompareEndeavor) => string }[] = [
    { label: "Category", getValue: (e) => e.category },
    { label: "Status", getValue: (e) => e.status },
    { label: "Members", getValue: (e) => String(e.memberCount) },
    { label: "Task Completion", getValue: (e) => completionRate(e) },
    { label: "Location Type", getValue: (e) => e.locationType },
    {
      label: "Location",
      getValue: (e) => e.location || "Not specified",
    },
    {
      label: "Capacity",
      getValue: (e) => (e.capacity ? String(e.capacity) : "Unlimited"),
    },
    {
      label: "Cost to Join",
      getValue: (e) =>
        e.costPerPerson ? `$${e.costPerPerson}` : "Free",
    },
    {
      label: "Funding",
      getValue: (e) =>
        e.fundingEnabled
          ? `$${e.fundingRaised} / $${e.fundingGoal ?? "?"}`
          : "Not enabled",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader breadcrumb={{ label: "Compare", href: "/compare" }} />

      <main className="mx-auto max-w-6xl px-4 pt-24 pb-16">
        <h1 className="mb-2 text-3xl font-bold">Compare Endeavors</h1>
        <p className="mb-8 text-sm text-medium-gray">
          Select up to 3 endeavors to compare side by side.
        </p>

        {/* Search input */}
        {endeavors.length < 3 && (
          <div className="relative mb-8 max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              placeholder="Search endeavors to add..."
              className="w-full border border-medium-gray/20 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
            />
            {showResults && results.length > 0 && (
              <div className="absolute inset-x-0 top-full z-10 border border-medium-gray/20 bg-black">
                {results
                  .filter((r) => !endeavors.some((e) => e.id === r.id))
                  .slice(0, 6)
                  .map((r) => (
                    <button
                      key={r.id}
                      onClick={() => selectEndeavor(r.id)}
                      disabled={loading === r.id}
                      className="block w-full px-4 py-2 text-left text-sm text-light-gray hover:bg-code-green/10 hover:text-white transition-colors disabled:opacity-50"
                    >
                      {r.title}
                      {loading === r.id && (
                        <span className="ml-2 text-xs text-medium-gray">
                          loading...
                        </span>
                      )}
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {endeavors.length === 0 && (
          <div className="border border-dashed border-medium-gray/20 p-16 text-center">
            <p className="text-sm text-medium-gray">
              No endeavors selected. Use the search above to add endeavors for
              comparison.
            </p>
          </div>
        )}

        {/* Column cards */}
        {endeavors.length > 0 && (
          <>
            <div
              className={`mb-8 grid gap-4 ${
                endeavors.length === 1
                  ? "grid-cols-1 max-w-sm"
                  : endeavors.length === 2
                  ? "sm:grid-cols-2"
                  : "sm:grid-cols-3"
              }`}
            >
              {endeavors.map((e) => (
                <div
                  key={e.id}
                  className="border border-medium-gray/20 overflow-hidden"
                >
                  {e.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={e.imageUrl}
                      alt=""
                      className="h-32 w-full object-cover"
                    />
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/endeavors/${e.id}`}
                        className="text-lg font-semibold text-code-blue hover:text-code-green transition-colors"
                      >
                        {e.title}
                      </Link>
                      <button
                        onClick={() => removeEndeavor(e.id)}
                        className="shrink-0 border border-medium-gray/20 px-2 py-1 text-xs text-medium-gray hover:border-red-500/50 hover:text-red-400 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-medium-gray">
                      {e.category} &middot; {e.status} &middot;{" "}
                      {e.memberCount} members
                    </p>
                    <p className="mt-2 text-sm text-light-gray line-clamp-2">
                      {e.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Comparison table */}
            {endeavors.length >= 2 && (
              <div>
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
                  {"// comparison"}
                </h2>
                <div className="border border-medium-gray/20 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-medium-gray/20 bg-medium-gray/5">
                        <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-medium-gray font-normal">
                          Field
                        </th>
                        {endeavors.map((e, i) => (
                          <th
                            key={e.id}
                            className={`px-4 py-3 text-left text-xs font-semibold ${
                              i === 0
                                ? "text-code-green"
                                : i === 1
                                ? "text-code-blue"
                                : "text-purple-400"
                            }`}
                          >
                            {e.title}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr
                          key={row.label}
                          className="border-b border-medium-gray/10"
                        >
                          <td className="px-4 py-2 text-xs text-medium-gray whitespace-nowrap">
                            {row.label}
                          </td>
                          {endeavors.map((e) => (
                            <td
                              key={e.id}
                              className="px-4 py-2 text-light-gray"
                            >
                              {row.getValue(e)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
