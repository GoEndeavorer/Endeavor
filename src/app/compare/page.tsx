"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

/* ── Types ─────────────────────────────────────────────────────────────── */

type Suggestion = {
  type: "endeavor" | "user" | "category";
  id: string;
  title: string;
  subtitle?: string;
};

type EndeavorDetail = {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  locationType: string;
  location: string | null;
  joinType: string;
  capacity: number | null;
  costPerPerson: number | null;
  fundingEnabled: boolean;
  fundingGoal: number | null;
  fundingRaised: number;
  memberCount: number;
  imageUrl: string | null;
  createdAt: string;
  needs: string[];
  stats: {
    milestones: number;
    milestonesCompleted: number;
    tasks: number;
    tasksCompleted: number;
    stories: number;
  };
};

/* ── Status / category color maps ─────────────────────────────────────── */

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-medium-gray/20 text-medium-gray",
  open: "bg-code-green/15 text-code-green",
  "in-progress": "bg-code-blue/15 text-code-blue",
  completed: "bg-emerald-500/15 text-emerald-400",
  cancelled: "bg-red-500/15 text-red-400",
};

const SLOT_COLORS = [
  { text: "text-code-green", border: "border-code-green", bg: "bg-code-green" },
  { text: "text-code-blue", border: "border-code-blue", bg: "bg-code-blue" },
  { text: "text-amber-400", border: "border-amber-400", bg: "bg-amber-400" },
];

const MAX_SLOTS = 3;

/* ── Main component ───────────────────────────────────────────────────── */

export default function ComparePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [endeavors, setEndeavors] = useState<(EndeavorDetail | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [fetchingId, setFetchingId] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Parse IDs from URL
  const ids = useMemo(() => {
    const raw = searchParams.get("ids") || "";
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, MAX_SLOTS);
  }, [searchParams]);

  // Fetch endeavors from URL param IDs
  useEffect(() => {
    if (ids.length === 0) {
      setEndeavors([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all(
      ids.map(async (id) => {
        try {
          const res = await fetch(`/api/endeavors/${id}`);
          if (res.ok) return (await res.json()) as EndeavorDetail;
          return null;
        } catch {
          return null;
        }
      })
    ).then((results) => {
      if (!cancelled) {
        setEndeavors(results.filter(Boolean) as EndeavorDetail[]);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [ids]);

  // Search suggestions
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search/suggestions?q=${encodeURIComponent(query)}`
        );
        if (res.ok) {
          const data = await res.json();
          // API returns array of typed suggestions or { suggestions: string[] }
          if (Array.isArray(data)) {
            setSuggestions(
              data.filter((s: Suggestion) => s.type === "endeavor")
            );
          } else {
            setSuggestions([]);
          }
        }
      } catch {
        setSuggestions([]);
      }
    }, 200);
    return () => clearTimeout(timeout);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        searchRef.current &&
        !searchRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Update URL with current IDs
  const updateUrl = useCallback(
    (newIds: string[]) => {
      const params = new URLSearchParams();
      if (newIds.length > 0) {
        params.set("ids", newIds.join(","));
      }
      router.replace(`/compare?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  // Add an endeavor
  const addEndeavor = useCallback(
    async (id: string) => {
      // Prevent duplicates or exceeding max
      const currentIds = endeavors.map((e) => e?.id).filter(Boolean) as string[];
      if (currentIds.includes(id) || currentIds.length >= MAX_SLOTS) return;

      setFetchingId(id);
      try {
        const res = await fetch(`/api/endeavors/${id}`);
        if (res.ok) {
          const data = (await res.json()) as EndeavorDetail;
          const newEndeavors = [...endeavors, data];
          setEndeavors(newEndeavors);
          updateUrl([...currentIds, id]);
        }
      } finally {
        setFetchingId(null);
        setShowDropdown(false);
        setQuery("");
      }
    },
    [endeavors, updateUrl]
  );

  // Remove an endeavor
  const removeEndeavor = useCallback(
    (id: string) => {
      const filtered = endeavors.filter((e) => e?.id !== id);
      setEndeavors(filtered);
      updateUrl(filtered.map((e) => e!.id));
    },
    [endeavors, updateUrl]
  );

  // Filter out already-selected endeavors from suggestions
  const selectedIds = new Set(endeavors.map((e) => e?.id));
  const filteredSuggestions = suggestions.filter(
    (s) => !selectedIds.has(s.id)
  );

  const canAddMore = endeavors.length < MAX_SLOTS;

  /* ── Comparison rows ──────────────────────────────────────────────────── */

  const comparisonRows: {
    label: string;
    key: string;
    getValue: (e: EndeavorDetail) => string;
  }[] = [
    {
      label: "Title",
      key: "title",
      getValue: (e) => e.title,
    },
    {
      label: "Category",
      key: "category",
      getValue: (e) => e.category,
    },
    {
      label: "Status",
      key: "status",
      getValue: (e) => formatStatus(e.status),
    },
    {
      label: "Members",
      key: "members",
      getValue: (e) => String(e.memberCount),
    },
    {
      label: "Milestones",
      key: "milestones",
      getValue: (e) =>
        `${e.stats.milestonesCompleted}/${e.stats.milestones} completed`,
    },
    {
      label: "Stories",
      key: "stories",
      getValue: (e) => String(e.stats.stories),
    },
    {
      label: "Location Type",
      key: "locationType",
      getValue: (e) => formatStatus(e.locationType),
    },
    {
      label: "Cost to Join",
      key: "cost",
      getValue: (e) =>
        e.costPerPerson ? `$${e.costPerPerson}` : "Free",
    },
    {
      label: "Funding Progress",
      key: "funding",
      getValue: (e) => formatFunding(e),
    },
    {
      label: "Join Type",
      key: "joinType",
      getValue: (e) => formatStatus(e.joinType || "open"),
    },
  ];

  /* ── Render ──────────────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader breadcrumb={{ label: "Compare", href: "/compare" }} />

      <main className="mx-auto max-w-6xl px-4 pt-24 pb-16">
        <h1 className="text-3xl font-bold mb-2">Compare Endeavors</h1>
        <p className="mb-8 text-sm text-medium-gray">
          Compare up to {MAX_SLOTS} endeavors side by side.
        </p>

        {/* Loading state */}
        {loading && ids.length > 0 && (
          <div className="border border-medium-gray/20 p-16 text-center mb-8">
            <p className="text-sm text-medium-gray animate-pulse">
              Loading endeavors...
            </p>
          </div>
        )}

        {/* Selected endeavor cards */}
        {!loading && endeavors.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// compare"}
            </h2>
            <div
              className={`grid gap-4 ${
                endeavors.length === 1
                  ? "grid-cols-1 sm:grid-cols-2"
                  : endeavors.length === 2
                  ? "grid-cols-1 sm:grid-cols-2"
                  : "grid-cols-1 sm:grid-cols-3"
              }`}
            >
              {endeavors.map((endeavor, i) =>
                endeavor ? (
                  <div
                    key={endeavor.id}
                    className={`border ${SLOT_COLORS[i].border}/40 overflow-hidden`}
                  >
                    {endeavor.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={endeavor.imageUrl}
                        alt=""
                        className="h-28 w-full object-cover"
                      />
                    )}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/endeavors/${endeavor.id}`}
                          className={`text-base font-semibold ${SLOT_COLORS[i].text} hover:underline transition-colors`}
                        >
                          {endeavor.title}
                        </Link>
                        <button
                          onClick={() => removeEndeavor(endeavor.id)}
                          className="shrink-0 border border-medium-gray/20 px-2 py-1 text-xs text-medium-gray hover:border-red-500/50 hover:text-red-400 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span
                          className={`inline-block px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                            STATUS_COLORS[endeavor.status] ||
                            "bg-medium-gray/20 text-medium-gray"
                          }`}
                        >
                          {formatStatus(endeavor.status)}
                        </span>
                        <span className="inline-block px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-medium-gray/15 text-light-gray">
                          {endeavor.category}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-medium-gray">
                        {endeavor.memberCount} members &middot;{" "}
                        {endeavor.stats.milestones} milestones &middot;{" "}
                        {endeavor.stats.stories} stories
                      </p>
                    </div>
                  </div>
                ) : null
              )}

              {/* Add endeavor slot */}
              {canAddMore && (
                <div className="flex min-h-[140px] flex-col items-center justify-center gap-2 border border-dashed border-medium-gray/20 hover:border-medium-gray/40 transition-colors">
                  <span className="text-2xl text-medium-gray">+</span>
                  <span className="text-xs uppercase tracking-widest text-medium-gray">
                    Add endeavor
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search / add endeavor dropdown */}
        {canAddMore && !loading && (
          <div ref={searchRef} className="relative mb-10 max-w-md">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// add endeavor"}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-medium-gray text-sm">
                &gt;
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search endeavors to compare..."
                className="w-full border border-medium-gray/20 bg-transparent py-3 pl-8 pr-4 text-sm text-white outline-none transition-colors focus:border-code-green font-[family-name:var(--font-fira-code),monospace]"
              />
            </div>

            {showDropdown && filteredSuggestions.length > 0 && (
              <div className="absolute inset-x-0 top-full z-10 mt-1 max-h-64 overflow-y-auto border border-medium-gray/20 bg-black">
                {filteredSuggestions.slice(0, 8).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => addEndeavor(s.id)}
                    disabled={fetchingId === s.id}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-code-green/10 disabled:opacity-50"
                  >
                    <div className="flex h-8 w-10 shrink-0 items-center justify-center bg-code-green/10 text-xs text-code-green">
                      {s.title.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">
                        {s.title}
                      </p>
                      {s.subtitle && (
                        <p className="text-xs text-medium-gray">{s.subtitle}</p>
                      )}
                    </div>
                    {fetchingId === s.id && (
                      <span className="text-xs text-medium-gray">
                        loading...
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {showDropdown &&
              query.length >= 2 &&
              filteredSuggestions.length === 0 &&
              fetchingId === null && (
                <div className="absolute inset-x-0 top-full z-10 mt-1 border border-medium-gray/20 bg-black px-4 py-4 text-center text-sm text-medium-gray">
                  No endeavors found for &ldquo;{query}&rdquo;
                </div>
              )}
          </div>
        )}

        {/* Empty state */}
        {!loading && endeavors.length === 0 && (
          <div className="border border-dashed border-medium-gray/20 p-16 text-center">
            <p className="text-sm text-medium-gray">
              Use the search above to select endeavors for comparison.
            </p>
          </div>
        )}

        {/* Side-by-side comparison table */}
        {!loading && endeavors.length >= 2 && (
          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// compare"}
            </h2>
            <div className="border border-medium-gray/20 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-medium-gray/20 bg-medium-gray/5">
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-medium-gray font-normal min-w-[140px]">
                      Field
                    </th>
                    {endeavors.map((e, i) =>
                      e ? (
                        <th
                          key={e.id}
                          className={`px-4 py-3 text-left text-xs font-semibold ${SLOT_COLORS[i].text}`}
                        >
                          <Link
                            href={`/endeavors/${e.id}`}
                            className="hover:underline"
                          >
                            {e.title}
                          </Link>
                        </th>
                      ) : null
                    )}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => (
                    <tr
                      key={row.key}
                      className="border-b border-medium-gray/10 last:border-b-0"
                    >
                      <td className="px-4 py-3 text-xs text-medium-gray whitespace-nowrap">
                        {row.label}
                      </td>
                      {endeavors.map((e, i) =>
                        e ? (
                          <td
                            key={e.id}
                            className={`px-4 py-3 font-[family-name:var(--font-fira-code),monospace] text-light-gray`}
                          >
                            {row.key === "title" ? (
                              <Link
                                href={`/endeavors/${e.id}`}
                                className={`${SLOT_COLORS[i].text} hover:underline`}
                              >
                                {row.getValue(e)}
                              </Link>
                            ) : row.key === "status" ? (
                              <span
                                className={`inline-block px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                                  STATUS_COLORS[e.status] ||
                                  "bg-medium-gray/20 text-medium-gray"
                                }`}
                              >
                                {row.getValue(e)}
                              </span>
                            ) : (
                              row.getValue(e)
                            )}
                          </td>
                        ) : null
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Visual bar comparison */}
            <div className="mt-8">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
                {"// visual breakdown"}
              </h2>
              <div className="space-y-4">
                <CompareBar
                  label="Members"
                  endeavors={endeavors.filter(Boolean) as EndeavorDetail[]}
                  getValue={(e) => e.memberCount}
                />
                <CompareBar
                  label="Milestones"
                  endeavors={endeavors.filter(Boolean) as EndeavorDetail[]}
                  getValue={(e) => e.stats.milestones}
                />
                <CompareBar
                  label="Stories"
                  endeavors={endeavors.filter(Boolean) as EndeavorDetail[]}
                  getValue={(e) => e.stats.stories}
                />
                <CompareBar
                  label="Tasks"
                  endeavors={endeavors.filter(Boolean) as EndeavorDetail[]}
                  getValue={(e) => e.stats.tasks}
                />
                {endeavors.some((e) => e?.fundingEnabled) && (
                  <CompareBar
                    label="Funding Progress"
                    endeavors={endeavors.filter(Boolean) as EndeavorDetail[]}
                    getValue={(e) => fundingPercent(e)}
                    suffix="%"
                    maxOverride={100}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

/* ── Visual comparison bar (supports 2-3 endeavors) ────────────────────── */

function CompareBar({
  label,
  endeavors,
  getValue,
  suffix = "",
  maxOverride,
}: {
  label: string;
  endeavors: EndeavorDetail[];
  getValue: (e: EndeavorDetail) => number;
  suffix?: string;
  maxOverride?: number;
}) {
  const values = endeavors.map(getValue);
  const maxVal = maxOverride ?? Math.max(...values, 1);

  return (
    <div className="border border-medium-gray/10 p-4">
      <p className="mb-3 text-xs text-medium-gray uppercase tracking-widest">
        {label}
      </p>
      <div className="space-y-2">
        {endeavors.map((e, i) => {
          const val = values[i];
          const pct = Math.min((val / maxVal) * 100, 100);
          const isMax = val === Math.max(...values) && val > 0;
          const color = SLOT_COLORS[i];

          return (
            <div key={e.id} className="flex items-center gap-3">
              <span className={`w-24 truncate text-xs ${color.text}`}>
                {e.title}
              </span>
              <div className="flex-1 h-5 bg-medium-gray/10 overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-500 ${color.bg}/${
                    isMax ? "40" : "20"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span
                className={`w-20 text-right text-xs font-[family-name:var(--font-fira-code),monospace] ${
                  isMax ? `${color.text} font-semibold` : color.text
                }`}
              >
                {val}
                {suffix}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Helpers ────────────────────────────────────────────────────────────── */

function formatStatus(status: string): string {
  return status
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatFunding(e: EndeavorDetail): string {
  if (!e.fundingEnabled) return "Not enabled";
  const raised = e.fundingRaised || 0;
  const goal = e.fundingGoal;
  if (goal) {
    const pct = Math.round((raised / goal) * 100);
    return `$${raised} / $${goal} (${pct}%)`;
  }
  return `$${raised} raised`;
}

function fundingPercent(e: EndeavorDetail): number {
  if (!e.fundingEnabled || !e.fundingGoal) return 0;
  return Math.min(
    Math.round(((e.fundingRaised || 0) / e.fundingGoal) * 100),
    100
  );
}
