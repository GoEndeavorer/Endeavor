"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";

type Endeavor = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string | null;
  locationType: string;
  needs: string[] | null;
  costPerPerson: number | null;
  capacity: number | null;
  fundingEnabled: boolean;
  fundingGoal: number | null;
  fundingRaised: number;
  memberCount: number;
  createdAt: string;
};

const categories = [
  "All",
  "Adventure",
  "Scientific",
  "Creative",
  "Tech",
  "Cultural",
  "Community",
];

const locationTypes = [
  { value: "", label: "Any" },
  { value: "in-person", label: "In-Person" },
  { value: "remote", label: "Remote" },
  { value: "either", label: "Either" },
];

function EndeavorCard({ endeavor }: { endeavor: Endeavor }) {
  const categoryColors: Record<string, string> = {
    Scientific: "border-code-blue text-code-blue",
    Tech: "border-purple-400 text-purple-400",
    Creative: "border-yellow-400 text-yellow-400",
    Adventure: "border-code-green text-code-green",
    Cultural: "border-orange-400 text-orange-400",
    Community: "border-pink-400 text-pink-400",
  };

  return (
    <Link
      href={`/endeavors/${endeavor.id}`}
      className="group flex flex-col border border-medium-gray/30 p-5 transition-colors hover:border-code-green/50"
    >
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`border px-2 py-0.5 text-xs uppercase ${
            categoryColors[endeavor.category] ||
            "border-medium-gray text-medium-gray"
          }`}
        >
          {endeavor.category}
        </span>
        <span className="text-xs text-medium-gray">
          {endeavor.locationType === "in-person"
            ? "In-Person"
            : endeavor.locationType === "remote"
            ? "Remote"
            : "In-Person / Remote"}
        </span>
      </div>

      <h3 className="mb-1 text-lg font-bold">{endeavor.title}</h3>
      {endeavor.location && (
        <p className="mb-1 text-xs text-medium-gray">{endeavor.location}</p>
      )}
      <p className="mb-4 flex-1 text-sm leading-relaxed text-light-gray line-clamp-3">
        {endeavor.description}
      </p>

      {endeavor.needs && endeavor.needs.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {endeavor.needs.slice(0, 3).map((need) => (
            <span
              key={need}
              className="bg-white/5 px-2 py-0.5 text-xs text-light-gray"
            >
              need: {need}
            </span>
          ))}
          {endeavor.needs.length > 3 && (
            <span className="px-2 py-0.5 text-xs text-medium-gray">
              +{endeavor.needs.length - 3} more
            </span>
          )}
        </div>
      )}

      <div className="mt-auto">
        {endeavor.costPerPerson !== null && endeavor.costPerPerson > 0 && (
          <p className="text-sm font-semibold text-code-green">
            ${endeavor.costPerPerson.toLocaleString()}/person
          </p>
        )}
        {endeavor.costPerPerson === 0 && (
          <p className="text-sm font-semibold text-code-green">Free to join</p>
        )}
        {endeavor.fundingEnabled &&
          endeavor.fundingGoal &&
          endeavor.fundingGoal > 0 && (
            <div className="mt-2">
              <div className="mb-1 flex justify-between text-xs text-medium-gray">
                <span>${endeavor.fundingRaised.toLocaleString()} raised</span>
                <span>
                  {Math.round(
                    (endeavor.fundingRaised / endeavor.fundingGoal) * 100
                  )}
                  % of ${endeavor.fundingGoal.toLocaleString()}
                </span>
              </div>
              <div className="h-1 w-full bg-medium-gray/30">
                <div
                  className="h-1 bg-code-green"
                  style={{
                    width: `${Math.min(
                      100,
                      (endeavor.fundingRaised / endeavor.fundingGoal) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-medium-gray/20 pt-3">
        <span className="text-xs text-medium-gray">
          {endeavor.memberCount} joined
          {endeavor.capacity ? ` / ${endeavor.capacity} spots` : ""}
        </span>
        <span className="text-xs font-semibold text-code-blue transition-colors group-hover:text-code-green">
          View &rarr;
        </span>
      </div>
    </Link>
  );
}

export default function FeedPage() {
  const { data: session } = useSession();
  const [endeavors, setEndeavors] = useState<Endeavor[]>([]);
  const [recommended, setRecommended] = useState<Endeavor[]>([]);
  const [trending, setTrending] = useState<Endeavor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [locationType, setLocationType] = useState("");

  const fetchEndeavors = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category !== "All") params.set("category", category);
    if (locationType) params.set("locationType", locationType);
    if (search) params.set("search", search);

    try {
      const res = await fetch(`/api/endeavors?${params}`);
      const data = await res.json();
      setEndeavors(data);
    } catch (err) {
      console.error("Failed to fetch endeavors:", err);
    } finally {
      setLoading(false);
    }
  }, [category, locationType, search]);

  useEffect(() => {
    fetchEndeavors();
  }, [fetchEndeavors]);

  // Fetch trending and recommended on mount
  useEffect(() => {
    fetch("/api/endeavors/trending")
      .then((r) => r.json())
      .then(setTrending)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (session) {
      fetch("/api/endeavors/recommended")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setRecommended(data);
        })
        .catch(() => {});
    }
  }, [session]);

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-medium-gray/30 bg-black/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold">
            Endeavor
          </Link>
          <nav className="flex items-center gap-4">
            {session ? (
              <>
                <Link
                  href="/endeavors/create"
                  className="border border-code-green bg-code-green px-4 py-2 text-xs font-bold uppercase text-black transition-colors hover:bg-transparent hover:text-code-green"
                >
                  + New Endeavor
                </Link>
                <Link
                  href="/profile"
                  className="text-sm text-code-blue hover:text-code-green"
                >
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-code-blue hover:text-code-green"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="border border-medium-gray bg-white px-4 py-2 text-xs font-semibold text-black"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-24 pb-16">
        <h1 className="mb-8 text-3xl font-bold">Explore Endeavors</h1>

        {/* Recommended for you */}
        {session && recommended.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-code-green">
              {"// recommended for you"}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {recommended.slice(0, 3).map((e) => (
                <EndeavorCard key={e.id} endeavor={e} />
              ))}
            </div>
          </div>
        )}

        {/* Trending */}
        {trending.length > 0 && (
          <div className="mb-12">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-code-blue">
              {"// trending"}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {trending.slice(0, 3).map((e) => (
                <EndeavorCard key={e.id} endeavor={e} />
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search endeavors..."
            className="w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
          />
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`border px-3 py-1.5 text-xs font-semibold uppercase transition-colors ${
                  category === cat
                    ? "border-code-green bg-code-green text-black"
                    : "border-medium-gray/50 text-medium-gray hover:border-code-green hover:text-code-green"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {locationTypes.map((lt) => (
              <button
                key={lt.value}
                onClick={() => setLocationType(lt.value)}
                className={`border px-3 py-1.5 text-xs uppercase transition-colors ${
                  locationType === lt.value
                    ? "border-code-blue bg-code-blue text-black font-semibold"
                    : "border-medium-gray/50 text-medium-gray hover:border-code-blue hover:text-code-blue"
                }`}
              >
                {lt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="py-20 text-center text-medium-gray">
            Loading endeavors...
          </div>
        ) : endeavors.length === 0 ? (
          <div className="py-20 text-center">
            <p className="mb-4 text-lg text-medium-gray">
              No endeavors found.
            </p>
            {session && (
              <Link
                href="/endeavors/create"
                className="border border-code-green px-6 py-3 text-sm font-bold uppercase text-code-green transition-colors hover:bg-code-green hover:text-black"
              >
                Create the first one
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {endeavors.map((e) => (
              <EndeavorCard key={e.id} endeavor={e} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
