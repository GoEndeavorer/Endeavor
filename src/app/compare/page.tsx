"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

type SearchResult = {
  id: string;
  title: string;
  category: string;
  status: string;
  imageUrl: string | null;
};

type EndeavorDetail = {
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
  imageUrl: string | null;
  createdAt: string;
  needs: string[];
  stats: {
    milestones: number;
    milestonesCompleted: number;
    tasks: number;
    tasksCompleted: number;
    discussions: number;
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

const CATEGORY_COLORS: Record<string, string> = {
  technology: "bg-violet-500/15 text-violet-400",
  creative: "bg-pink-500/15 text-pink-400",
  education: "bg-amber-500/15 text-amber-400",
  community: "bg-cyan-500/15 text-cyan-400",
  business: "bg-orange-500/15 text-orange-400",
  health: "bg-emerald-500/15 text-emerald-400",
  science: "bg-indigo-500/15 text-indigo-400",
  sports: "bg-lime-500/15 text-lime-400",
  environment: "bg-green-500/15 text-green-400",
};

export default function ComparePage() {
  const [slotA, setSlotA] = useState<EndeavorDetail | null>(null);
  const [slotB, setSlotB] = useState<EndeavorDetail | null>(null);
  const [activeSlot, setActiveSlot] = useState<"a" | "b">("a");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [fetching, setFetching] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Search endeavors on query change
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.endeavors || []);
        }
      } catch {
        setResults([]);
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

  const selectEndeavor = useCallback(
    async (id: string) => {
      // Don't allow selecting the same endeavor in both slots
      if (slotA?.id === id || slotB?.id === id) return;
      setFetching(id);
      try {
        const res = await fetch(`/api/endeavors/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (activeSlot === "a") {
            setSlotA(data);
            if (!slotB) setActiveSlot("b");
          } else {
            setSlotB(data);
          }
        }
      } finally {
        setFetching(null);
        setShowDropdown(false);
        setQuery("");
      }
    },
    [activeSlot, slotA, slotB]
  );

  const clearSlot = (slot: "a" | "b") => {
    if (slot === "a") setSlotA(null);
    else setSlotB(null);
    setActiveSlot(slot);
  };

  const bothSelected = slotA !== null && slotB !== null;

  // Filter out already-selected endeavors from results
  const filteredResults = results.filter(
    (r) => r.id !== slotA?.id && r.id !== slotB?.id
  );

  // Compute needs overlap
  const needsOverlap = useMemo(() => {
    if (!slotA || !slotB) return { shared: [], onlyA: [], onlyB: [] };
    const needsA = (slotA.needs || []).map((n) => n.toLowerCase().trim());
    const needsB = (slotB.needs || []).map((n) => n.toLowerCase().trim());
    const setB = new Set(needsB);
    const setA = new Set(needsA);
    const shared = needsA.filter((n) => setB.has(n));
    const onlyA = needsA.filter((n) => !setB.has(n));
    const onlyB = needsB.filter((n) => !setA.has(n));
    return { shared, onlyA, onlyB };
  }, [slotA, slotB]);

  // Similarity score for merge suggestion
  const similarityScore = useMemo(() => {
    if (!slotA || !slotB) return 0;
    let score = 0;
    // Same category = +30
    if (slotA.category === slotB.category) score += 30;
    // Needs overlap ratio = up to +40
    const totalNeeds = new Set([
      ...(slotA.needs || []).map((n) => n.toLowerCase()),
      ...(slotB.needs || []).map((n) => n.toLowerCase()),
    ]).size;
    if (totalNeeds > 0) {
      score += Math.round((needsOverlap.shared.length / totalNeeds) * 40);
    }
    // Same location type = +15
    if (slotA.locationType === slotB.locationType) score += 15;
    // Same status = +15
    if (slotA.status === slotB.status) score += 15;
    return score;
  }, [slotA, slotB, needsOverlap]);

  const shareComparison = () => {
    if (!slotA || !slotB) return;
    const url = `${window.location.origin}/compare?a=${slotA.id}&b=${slotB.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Helper: completion rate
  const completionRate = (e: EndeavorDetail) => {
    const total = e.stats.tasks;
    if (total === 0) return 0;
    return Math.round((e.stats.tasksCompleted / total) * 100);
  };

  const comparisonRows: {
    label: string;
    key: string;
    getA: () => string;
    getB: () => string;
    highlight?: boolean;
  }[] =
    bothSelected
      ? [
          {
            label: "Status",
            key: "status",
            getA: () => formatStatus(slotA.status),
            getB: () => formatStatus(slotB.status),
          },
          {
            label: "Category",
            key: "category",
            getA: () => slotA.category,
            getB: () => slotB.category,
          },
          {
            label: "Members",
            key: "members",
            getA: () => String(slotA.memberCount),
            getB: () => String(slotB.memberCount),
            highlight: true,
          },
          {
            label: "Tasks",
            key: "tasks",
            getA: () =>
              `${slotA.stats.tasksCompleted}/${slotA.stats.tasks} completed`,
            getB: () =>
              `${slotB.stats.tasksCompleted}/${slotB.stats.tasks} completed`,
            highlight: true,
          },
          {
            label: "Completion Rate",
            key: "completionRate",
            getA: () => `${completionRate(slotA)}%`,
            getB: () => `${completionRate(slotB)}%`,
            highlight: true,
          },
          {
            label: "Milestones",
            key: "milestones",
            getA: () =>
              `${slotA.stats.milestonesCompleted}/${slotA.stats.milestones} completed`,
            getB: () =>
              `${slotB.stats.milestonesCompleted}/${slotB.stats.milestones} completed`,
            highlight: true,
          },
          {
            label: "Discussions",
            key: "discussions",
            getA: () => String(slotA.stats.discussions || 0),
            getB: () => String(slotB.stats.discussions || 0),
            highlight: true,
          },
          {
            label: "Funding",
            key: "funding",
            getA: () => formatFunding(slotA),
            getB: () => formatFunding(slotB),
          },
          {
            label: "Cost to Join",
            key: "cost",
            getA: () =>
              slotA.costPerPerson
                ? `$${slotA.costPerPerson}`
                : "Free",
            getB: () =>
              slotB.costPerPerson
                ? `$${slotB.costPerPerson}`
                : "Free",
          },
          {
            label: "Capacity",
            key: "capacity",
            getA: () =>
              slotA.capacity ? String(slotA.capacity) : "Unlimited",
            getB: () =>
              slotB.capacity ? String(slotB.capacity) : "Unlimited",
          },
          {
            label: "Date Created",
            key: "created",
            getA: () => formatDate(slotA.createdAt),
            getB: () => formatDate(slotB.createdAt),
          },
        ]
      : [];

  return (
    <div className="min-h-screen bg-black text-white">
      <AppHeader breadcrumb={{ label: "Compare", href: "/compare" }} />

      <main className="mx-auto max-w-6xl px-4 pt-24 pb-16">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold">Compare Endeavors</h1>
          {bothSelected && (
            <button
              onClick={shareComparison}
              className="flex items-center gap-2 border border-medium-gray/30 px-4 py-2 text-xs uppercase tracking-widest text-medium-gray hover:border-code-green/50 hover:text-code-green transition-colors"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              {copied ? "Link copied!" : "Share comparison"}
            </button>
          )}
        </div>
        <p className="mb-8 text-sm text-medium-gray">
          Select two endeavors to compare their stats side by side.
        </p>

        {/* Slot selection cards */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2">
          <SlotCard
            slot="a"
            label="Endeavor A"
            endeavor={slotA}
            isActive={activeSlot === "a"}
            onActivate={() => setActiveSlot("a")}
            onClear={() => clearSlot("a")}
            color="text-code-green"
            borderColor="border-code-green"
          />
          <SlotCard
            slot="b"
            label="Endeavor B"
            endeavor={slotB}
            isActive={activeSlot === "b"}
            onActivate={() => setActiveSlot("b")}
            onClear={() => clearSlot("b")}
            color="text-code-blue"
            borderColor="border-code-blue"
          />
        </div>

        {/* Search input */}
        {(!slotA || !slotB) && (
          <div ref={searchRef} className="relative mb-10 max-w-md">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// search"}
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
                placeholder={`Search for Endeavor ${activeSlot === "a" ? "A" : "B"}...`}
                className="w-full border border-medium-gray/20 bg-transparent py-3 pl-8 pr-4 text-sm text-white outline-none transition-colors focus:border-code-green font-[family-name:var(--font-fira-code),monospace]"
              />
            </div>

            {showDropdown && filteredResults.length > 0 && (
              <div className="absolute inset-x-0 top-full z-10 mt-1 max-h-64 overflow-y-auto border border-medium-gray/20 bg-black">
                {filteredResults.slice(0, 8).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => selectEndeavor(r.id)}
                    disabled={fetching === r.id}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-code-green/10 disabled:opacity-50"
                  >
                    {r.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.imageUrl}
                        alt=""
                        className="h-8 w-10 shrink-0 object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-10 shrink-0 items-center justify-center bg-code-green/10 text-xs text-code-green">
                        {r.title.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-white">
                        {r.title}
                      </p>
                      <p className="text-xs text-medium-gray">
                        {r.category} &middot; {r.status}
                      </p>
                    </div>
                    {fetching === r.id && (
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
              filteredResults.length === 0 &&
              fetching === null && (
                <div className="absolute inset-x-0 top-full z-10 mt-1 border border-medium-gray/20 bg-black px-4 py-4 text-center text-sm text-medium-gray">
                  No endeavors found for &ldquo;{query}&rdquo;
                </div>
              )}
          </div>
        )}

        {/* Empty state */}
        {!slotA && !slotB && (
          <div className="border border-dashed border-medium-gray/20 p-16 text-center">
            <p className="text-sm text-medium-gray">
              Use the search above to select two endeavors for comparison.
            </p>
          </div>
        )}

        {/* Side-by-side comparison */}
        {bothSelected && (
          <div>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// comparison"}
            </h2>
            <div className="border border-medium-gray/20 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-medium-gray/20 bg-medium-gray/5">
                    <th className="px-4 py-3 text-left text-xs uppercase tracking-widest text-medium-gray font-normal w-1/4">
                      Field
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-code-green w-[37.5%]">
                      <Link
                        href={`/endeavors/${slotA.id}`}
                        className="hover:underline"
                      >
                        {slotA.title}
                      </Link>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-code-blue w-[37.5%]">
                      <Link
                        href={`/endeavors/${slotB.id}`}
                        className="hover:underline"
                      >
                        {slotB.title}
                      </Link>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((row) => {
                    const valA = row.getA();
                    const valB = row.getB();
                    return (
                      <tr
                        key={row.key}
                        className="border-b border-medium-gray/10 last:border-b-0"
                      >
                        <td className="px-4 py-3 text-xs text-medium-gray whitespace-nowrap">
                          {row.label}
                        </td>
                        <td
                          className={`px-4 py-3 font-[family-name:var(--font-fira-code),monospace] ${
                            row.highlight && valA !== valB
                              ? numericCompare(valA, valB) > 0
                                ? "text-code-green"
                                : "text-light-gray"
                              : "text-light-gray"
                          }`}
                        >
                          {valA}
                        </td>
                        <td
                          className={`px-4 py-3 font-[family-name:var(--font-fira-code),monospace] ${
                            row.highlight && valA !== valB
                              ? numericCompare(valB, valA) > 0
                                ? "text-code-blue"
                                : "text-light-gray"
                              : "text-light-gray"
                          }`}
                        >
                          {valB}
                        </td>
                      </tr>
                    );
                  })}
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
                  valueA={slotA.memberCount}
                  valueB={slotB.memberCount}
                  nameA={slotA.title}
                  nameB={slotB.title}
                />
                <CompareBar
                  label="Tasks"
                  valueA={slotA.stats.tasks}
                  valueB={slotB.stats.tasks}
                  nameA={slotA.title}
                  nameB={slotB.title}
                />
                <CompareBar
                  label="Completion Rate"
                  valueA={completionRate(slotA)}
                  valueB={completionRate(slotB)}
                  nameA={slotA.title}
                  nameB={slotB.title}
                  suffix="%"
                  maxOverride={100}
                />
                <CompareBar
                  label="Discussion Activity"
                  valueA={slotA.stats.discussions || 0}
                  valueB={slotB.stats.discussions || 0}
                  nameA={slotA.title}
                  nameB={slotB.title}
                />
                <CompareBar
                  label="Milestones"
                  valueA={slotA.stats.milestones}
                  valueB={slotB.stats.milestones}
                  nameA={slotA.title}
                  nameB={slotB.title}
                />
                <CompareBar
                  label="Milestones Completed"
                  valueA={slotA.stats.milestonesCompleted}
                  valueB={slotB.stats.milestonesCompleted}
                  nameA={slotA.title}
                  nameB={slotB.title}
                />
                {(slotA.fundingEnabled || slotB.fundingEnabled) && (
                  <CompareBar
                    label="Funding Progress"
                    valueA={fundingPercent(slotA)}
                    valueB={fundingPercent(slotB)}
                    nameA={slotA.title}
                    nameB={slotB.title}
                    suffix="%"
                    maxOverride={100}
                  />
                )}
              </div>
            </div>

            {/* Needs / Skills overlap */}
            {((slotA.needs && slotA.needs.length > 0) ||
              (slotB.needs && slotB.needs.length > 0)) && (
              <div className="mt-8">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
                  {"// needs & skills overlap"}
                </h2>
                <div className="border border-medium-gray/20 p-5">
                  {needsOverlap.shared.length > 0 && (
                    <div className="mb-4">
                      <p className="mb-2 text-xs text-medium-gray uppercase tracking-widest">
                        Shared needs
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {needsOverlap.shared.map((n) => (
                          <span
                            key={n}
                            className="inline-flex items-center gap-1 border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs text-amber-400"
                          >
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                            >
                              <path d="M12 5v14M5 12h14" />
                            </svg>
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="grid gap-4 sm:grid-cols-2">
                    {needsOverlap.onlyA.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs text-code-green uppercase tracking-widest">
                          Only in {slotA.title}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {needsOverlap.onlyA.map((n) => (
                            <span
                              key={n}
                              className="border border-code-green/20 bg-code-green/5 px-2.5 py-1 text-xs text-code-green"
                            >
                              {n}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {needsOverlap.onlyB.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs text-code-blue uppercase tracking-widest">
                          Only in {slotB.title}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {needsOverlap.onlyB.map((n) => (
                            <span
                              key={n}
                              className="border border-code-blue/20 bg-code-blue/5 px-2.5 py-1 text-xs text-code-blue"
                            >
                              {n}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  {needsOverlap.shared.length === 0 &&
                    needsOverlap.onlyA.length === 0 &&
                    needsOverlap.onlyB.length === 0 && (
                      <p className="text-sm text-medium-gray">
                        No needs listed for either endeavor.
                      </p>
                    )}
                </div>
              </div>
            )}

            {/* Merge suggestion */}
            {similarityScore >= 50 && (
              <div className="mt-8">
                <div className="border border-amber-500/30 bg-amber-500/5 p-5">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-amber-500/30 text-amber-400">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="18" cy="18" r="3" />
                        <circle cx="6" cy="6" r="3" />
                        <path d="M6 21V9a9 9 0 0 0 9 9" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-amber-400">
                        These endeavors look similar ({similarityScore}% match)
                      </p>
                      <p className="mt-1 text-xs text-medium-gray leading-relaxed">
                        Both share the same{" "}
                        {slotA.category === slotB.category
                          ? `category (${slotA.category})`
                          : "characteristics"}
                        {needsOverlap.shared.length > 0 &&
                          ` and ${needsOverlap.shared.length} overlapping need${
                            needsOverlap.shared.length > 1 ? "s" : ""
                          }`}
                        . Consider reaching out to the other team about merging
                        efforts to avoid duplicated work and combine resources.
                      </p>
                      <div className="mt-3 flex gap-3">
                        <Link
                          href={`/endeavors/${slotA.id}`}
                          className="border border-amber-500/30 px-3 py-1.5 text-xs text-amber-400 hover:bg-amber-500/10 transition-colors"
                        >
                          Visit {slotA.title}
                        </Link>
                        <Link
                          href={`/endeavors/${slotB.id}`}
                          className="border border-amber-500/30 px-3 py-1.5 text-xs text-amber-400 hover:bg-amber-500/10 transition-colors"
                        >
                          Visit {slotB.title}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

/* ── Slot card component ────────────────────────────────────────────────── */

function SlotCard({
  label,
  endeavor,
  isActive,
  onActivate,
  onClear,
  color,
  borderColor,
}: {
  slot: "a" | "b";
  label: string;
  endeavor: EndeavorDetail | null;
  isActive: boolean;
  onActivate: () => void;
  onClear: () => void;
  color: string;
  borderColor: string;
}) {
  if (!endeavor) {
    return (
      <button
        onClick={onActivate}
        className={`flex min-h-[140px] flex-col items-center justify-center gap-2 border border-dashed transition-colors ${
          isActive
            ? `${borderColor} bg-medium-gray/5`
            : "border-medium-gray/20 hover:border-medium-gray/40"
        }`}
      >
        <span className={`text-2xl ${isActive ? color : "text-medium-gray"}`}>
          +
        </span>
        <span
          className={`text-xs uppercase tracking-widest ${
            isActive ? color : "text-medium-gray"
          }`}
        >
          Select {label}
        </span>
      </button>
    );
  }

  return (
    <div className={`border overflow-hidden ${borderColor}/40`}>
      {endeavor.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={endeavor.imageUrl}
          alt=""
          className="h-32 w-full object-cover"
        />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/endeavors/${endeavor.id}`}
            className={`text-lg font-semibold ${color} hover:underline transition-colors`}
          >
            {endeavor.title}
          </Link>
          <button
            onClick={onClear}
            className="shrink-0 border border-medium-gray/20 px-2 py-1 text-xs text-medium-gray hover:border-red-500/50 hover:text-red-400 transition-colors"
          >
            Remove
          </button>
        </div>
        {/* Badges */}
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Badge
            text={formatStatus(endeavor.status)}
            className={
              STATUS_COLORS[endeavor.status] || "bg-medium-gray/20 text-medium-gray"
            }
          />
          <Badge
            text={endeavor.category}
            className={
              CATEGORY_COLORS[endeavor.category.toLowerCase()] ||
              "bg-medium-gray/20 text-medium-gray"
            }
          />
          {endeavor.fundingEnabled && (
            <Badge
              text="Crowdfunding"
              className="bg-amber-500/15 text-amber-400"
            />
          )}
          {endeavor.costPerPerson ? (
            <Badge
              text={`$${endeavor.costPerPerson} to join`}
              className="bg-medium-gray/15 text-light-gray"
            />
          ) : (
            <Badge
              text="Free to join"
              className="bg-emerald-500/10 text-emerald-400"
            />
          )}
        </div>
        <p className="mt-2 text-xs text-medium-gray">
          {endeavor.memberCount} members &middot;{" "}
          {endeavor.stats.tasks} tasks &middot;{" "}
          {endeavor.stats.discussions || 0} discussions
        </p>
        <p className="mt-2 text-sm text-light-gray line-clamp-2">
          {endeavor.description}
        </p>
        {/* Needs preview */}
        {endeavor.needs && endeavor.needs.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {endeavor.needs.slice(0, 4).map((need) => (
              <span
                key={need}
                className="border border-medium-gray/15 px-2 py-0.5 text-[10px] text-medium-gray"
              >
                {need}
              </span>
            ))}
            {endeavor.needs.length > 4 && (
              <span className="px-1 py-0.5 text-[10px] text-medium-gray">
                +{endeavor.needs.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Badge component ──────────────────────────────────────────────────── */

function Badge({ text, className }: { text: string; className: string }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${className}`}
    >
      {text}
    </span>
  );
}

/* ── Visual comparison bar ──────────────────────────────────────────────── */

function CompareBar({
  label,
  valueA,
  valueB,
  nameA,
  nameB,
  prefix = "",
  suffix = "",
  maxOverride,
}: {
  label: string;
  valueA: number;
  valueB: number;
  nameA: string;
  nameB: string;
  prefix?: string;
  suffix?: string;
  maxOverride?: number;
}) {
  const max = maxOverride ?? Math.max(valueA, valueB, 1);
  const pctA = Math.min((valueA / max) * 100, 100);
  const pctB = Math.min((valueB / max) * 100, 100);
  const aWins = valueA > valueB;
  const bWins = valueB > valueA;

  return (
    <div
      className={`border p-4 transition-colors ${
        aWins
          ? "border-code-green/25"
          : bWins
          ? "border-code-blue/25"
          : "border-medium-gray/10"
      }`}
    >
      <p className="mb-3 text-xs text-medium-gray uppercase tracking-widest">
        {label}
      </p>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="w-24 truncate text-xs text-code-green">
            {nameA}
          </span>
          <div className="flex-1 h-5 bg-medium-gray/10 overflow-hidden relative">
            <div
              className={`h-full transition-all duration-500 ${
                aWins ? "bg-code-green/40" : "bg-code-green/20"
              }`}
              style={{ width: `${pctA}%` }}
            />
          </div>
          <span
            className={`w-20 text-right text-xs font-[family-name:var(--font-fira-code),monospace] ${
              aWins ? "text-code-green font-semibold" : "text-code-green"
            }`}
          >
            {prefix}{valueA}{suffix}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-24 truncate text-xs text-code-blue">
            {nameB}
          </span>
          <div className="flex-1 h-5 bg-medium-gray/10 overflow-hidden relative">
            <div
              className={`h-full transition-all duration-500 ${
                bWins ? "bg-code-blue/40" : "bg-code-blue/20"
              }`}
              style={{ width: `${pctB}%` }}
            />
          </div>
          <span
            className={`w-20 text-right text-xs font-[family-name:var(--font-fira-code),monospace] ${
              bWins ? "text-code-blue font-semibold" : "text-code-blue"
            }`}
          >
            {prefix}{valueB}{suffix}
          </span>
        </div>
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

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Unknown";
  }
}

function numericCompare(a: string, b: string): number {
  const numA = parseInt(a.replace(/[^0-9]/g, ""), 10) || 0;
  const numB = parseInt(b.replace(/[^0-9]/g, ""), 10) || 0;
  return numA - numB;
}
