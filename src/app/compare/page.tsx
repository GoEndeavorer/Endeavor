"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

type Endeavor = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string | null;
  locationType: string;
  status: string;
  needs: string[] | null;
  costPerPerson: number | null;
  capacity: number | null;
  fundingEnabled: boolean;
  fundingGoal: number | null;
  fundingRaised: number;
  imageUrl: string | null;
  memberCount: number;
  joinType: string;
  createdAt: string;
};

export default function ComparePage() {
  const [searchA, setSearchA] = useState("");
  const [searchB, setSearchB] = useState("");
  const [resultsA, setResultsA] = useState<{ id: string; title: string }[]>([]);
  const [resultsB, setResultsB] = useState<{ id: string; title: string }[]>([]);
  const [endeavorA, setEndeavorA] = useState<Endeavor | null>(null);
  const [endeavorB, setEndeavorB] = useState<Endeavor | null>(null);
  const [showSearchA, setShowSearchA] = useState(false);
  const [showSearchB, setShowSearchB] = useState(false);

  useEffect(() => {
    if (searchA.length < 2) { setResultsA([]); return; }
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(searchA)}`)
        .then((r) => r.ok ? r.json() : { endeavors: [] })
        .then((data) => setResultsA(data.endeavors || []));
    }, 200);
    return () => clearTimeout(t);
  }, [searchA]);

  useEffect(() => {
    if (searchB.length < 2) { setResultsB([]); return; }
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(searchB)}`)
        .then((r) => r.ok ? r.json() : { endeavors: [] })
        .then((data) => setResultsB(data.endeavors || []));
    }, 200);
    return () => clearTimeout(t);
  }, [searchB]);

  async function selectEndeavor(id: string, side: "A" | "B") {
    const res = await fetch(`/api/endeavors/${id}`);
    if (res.ok) {
      const data = await res.json();
      if (side === "A") {
        setEndeavorA(data);
        setShowSearchA(false);
        setSearchA("");
      } else {
        setEndeavorB(data);
        setShowSearchB(false);
        setSearchB("");
      }
    }
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Compare", href: "/compare" }} />

      <main className="mx-auto max-w-5xl px-4 pt-24 pb-16">
        <h1 className="mb-2 text-3xl font-bold">Compare Endeavors</h1>
        <p className="mb-8 text-sm text-medium-gray">
          Pick two endeavors to compare side by side.
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Side A */}
          <div>
            <div className="relative mb-4">
              <input
                type="text"
                value={searchA}
                onChange={(e) => { setSearchA(e.target.value); setShowSearchA(true); }}
                onFocus={() => setShowSearchA(true)}
                placeholder="Search first endeavor..."
                className="w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
              />
              {showSearchA && resultsA.length > 0 && (
                <div className="absolute inset-x-0 top-full z-10 border border-medium-gray/30 bg-black">
                  {resultsA.slice(0, 5).map((r) => (
                    <button
                      key={r.id}
                      onClick={() => selectEndeavor(r.id, "A")}
                      className="block w-full px-4 py-2 text-left text-sm hover:bg-code-green/10"
                    >
                      {r.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {endeavorA ? (
              <CompareCard endeavor={endeavorA} />
            ) : (
              <div className="border border-dashed border-medium-gray/30 p-12 text-center text-sm text-medium-gray">
                Select an endeavor
              </div>
            )}
          </div>

          {/* Side B */}
          <div>
            <div className="relative mb-4">
              <input
                type="text"
                value={searchB}
                onChange={(e) => { setSearchB(e.target.value); setShowSearchB(true); }}
                onFocus={() => setShowSearchB(true)}
                placeholder="Search second endeavor..."
                className="w-full border border-medium-gray/50 bg-transparent px-4 py-3 text-sm text-white outline-none focus:border-code-green"
              />
              {showSearchB && resultsB.length > 0 && (
                <div className="absolute inset-x-0 top-full z-10 border border-medium-gray/30 bg-black">
                  {resultsB.slice(0, 5).map((r) => (
                    <button
                      key={r.id}
                      onClick={() => selectEndeavor(r.id, "B")}
                      className="block w-full px-4 py-2 text-left text-sm hover:bg-code-green/10"
                    >
                      {r.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {endeavorB ? (
              <CompareCard endeavor={endeavorB} />
            ) : (
              <div className="border border-dashed border-medium-gray/30 p-12 text-center text-sm text-medium-gray">
                Select an endeavor
              </div>
            )}
          </div>
        </div>

        {/* Comparison table */}
        {endeavorA && endeavorB && (
          <div className="mt-8">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-widest text-code-green">
              {"// comparison"}
            </h2>
            <div className="border border-medium-gray/20 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-medium-gray/20 bg-medium-gray/5">
                    <th className="px-4 py-3 text-left text-xs text-medium-gray font-normal">Field</th>
                    <th className="px-4 py-3 text-left text-xs text-code-green font-semibold">{endeavorA.title}</th>
                    <th className="px-4 py-3 text-left text-xs text-code-blue font-semibold">{endeavorB.title}</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Category", endeavorA.category, endeavorB.category],
                    ["Status", endeavorA.status, endeavorB.status],
                    ["Location", endeavorA.location || "Not specified", endeavorB.location || "Not specified"],
                    ["Type", endeavorA.locationType, endeavorB.locationType],
                    ["Members", String(endeavorA.memberCount), String(endeavorB.memberCount)],
                    ["Capacity", endeavorA.capacity ? String(endeavorA.capacity) : "Unlimited", endeavorB.capacity ? String(endeavorB.capacity) : "Unlimited"],
                    ["Cost", endeavorA.costPerPerson ? `$${endeavorA.costPerPerson}` : "Free", endeavorB.costPerPerson ? `$${endeavorB.costPerPerson}` : "Free"],
                    ["Joining", endeavorA.joinType === "open" ? "Open" : "Request", endeavorB.joinType === "open" ? "Open" : "Request"],
                    ["Funding", endeavorA.fundingEnabled ? `$${endeavorA.fundingRaised}/${endeavorA.fundingGoal}` : "None", endeavorB.fundingEnabled ? `$${endeavorB.fundingRaised}/${endeavorB.fundingGoal}` : "None"],
                    ["Needs", (endeavorA.needs || []).join(", ") || "None listed", (endeavorB.needs || []).join(", ") || "None listed"],
                  ].map(([field, a, b]) => (
                    <tr key={field} className="border-b border-medium-gray/10">
                      <td className="px-4 py-2 text-medium-gray">{field}</td>
                      <td className="px-4 py-2 text-light-gray">{a}</td>
                      <td className="px-4 py-2 text-light-gray">{b}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function CompareCard({ endeavor }: { endeavor: Endeavor }) {
  return (
    <div className="border border-medium-gray/30 overflow-hidden">
      {endeavor.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={endeavor.imageUrl} alt="" className="h-32 w-full object-cover" />
      )}
      <div className="p-4">
        <Link
          href={`/endeavors/${endeavor.id}`}
          className="text-lg font-semibold hover:text-code-green transition-colors"
        >
          {endeavor.title}
        </Link>
        <p className="mt-1 text-xs text-medium-gray">
          {endeavor.category} &middot; {endeavor.status} &middot; {endeavor.memberCount} members
        </p>
        <p className="mt-2 text-sm text-light-gray line-clamp-2">{endeavor.description}</p>
      </div>
    </div>
  );
}
