"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  stats: {
    milestones: number;
    milestonesCompleted: number;
    tasks: number;
    tasksCompleted: number;
  };
};

export default function ComparePage() {
  const [slotA, setSlotA] = useState<EndeavorDetail | null>(null);
  const [slotB, setSlotB] = useState<EndeavorDetail | null>(null);
  const [activeSlot, setActiveSlot] = useState<"a" | "b">("a");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [fetching, setFetching] = useState<string | null>(null);
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
            label: "Milestones",
            key: "milestones",
            getA: () =>
              `${slotA.stats.milestonesCompleted}/${slotA.stats.milestones} completed`,
            getB: () =>
              `${slotB.stats.milestonesCompleted}/${slotB.stats.milestones} completed`,
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
        <h1 className="mb-2 text-3xl font-bold">Compare Endeavors</h1>
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

            {/* Visual bar comparison for members */}
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
                {slotA.fundingEnabled && slotB.fundingEnabled && (
                  <CompareBar
                    label="Funding Raised"
                    valueA={slotA.fundingRaised || 0}
                    valueB={slotB.fundingRaised || 0}
                    nameA={slotA.title}
                    nameB={slotB.title}
                    prefix="$"
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

/* ── Slot card component ────────────────────────────────────────────────── */

function SlotCard({
  slot,
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
        <p className="mt-1 text-xs text-medium-gray">
          {endeavor.category} &middot; {formatStatus(endeavor.status)} &middot;{" "}
          {endeavor.memberCount} members
        </p>
        <p className="mt-2 text-sm text-light-gray line-clamp-2">
          {endeavor.description}
        </p>
      </div>
    </div>
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
}: {
  label: string;
  valueA: number;
  valueB: number;
  nameA: string;
  nameB: string;
  prefix?: string;
}) {
  const max = Math.max(valueA, valueB, 1);
  const pctA = (valueA / max) * 100;
  const pctB = (valueB / max) * 100;

  return (
    <div className="border border-medium-gray/10 p-4">
      <p className="mb-3 text-xs text-medium-gray uppercase tracking-widest">
        {label}
      </p>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="w-24 truncate text-xs text-code-green">
            {nameA}
          </span>
          <div className="flex-1 h-5 bg-medium-gray/10 overflow-hidden">
            <div
              className="h-full bg-code-green/30 transition-all duration-500"
              style={{ width: `${pctA}%` }}
            />
          </div>
          <span className="w-16 text-right text-xs text-code-green font-[family-name:var(--font-fira-code),monospace]">
            {prefix}{valueA}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-24 truncate text-xs text-code-blue">
            {nameB}
          </span>
          <div className="flex-1 h-5 bg-medium-gray/10 overflow-hidden">
            <div
              className="h-full bg-code-blue/30 transition-all duration-500"
              style={{ width: `${pctB}%` }}
            />
          </div>
          <span className="w-16 text-right text-xs text-code-blue font-[family-name:var(--font-fira-code),monospace]">
            {prefix}{valueB}
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
