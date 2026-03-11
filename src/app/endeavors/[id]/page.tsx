"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { ShareButton } from "@/components/share-button";

type EndeavorDetail = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string | null;
  locationType: string;
  needs: string[] | null;
  status: string;
  costPerPerson: number | null;
  capacity: number | null;
  fundingEnabled: boolean;
  fundingGoal: number | null;
  fundingRaised: number;
  joinType: string;
  memberCount: number;
  creatorId: string;
  createdAt: string;
  creator: { id: string; name: string; image: string | null };
  members: {
    id: string;
    role: string;
    userId: string;
    userName: string;
    userImage: string | null;
  }[];
  pendingMembers: {
    id: string;
    userId: string;
    userName: string;
  }[];
};

export default function EndeavorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [endeavor, setEndeavor] = useState<EndeavorDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joinMessage, setJoinMessage] = useState("");

  useEffect(() => {
    async function fetchEndeavor() {
      try {
        const res = await fetch(`/api/endeavors/${id}`);
        if (res.ok) {
          setEndeavor(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch endeavor:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEndeavor();
  }, [id]);

  async function handleJoin() {
    if (!session) return;
    setJoining(true);
    try {
      // If there's a cost, redirect to Stripe checkout
      if (endeavor?.costPerPerson && endeavor.costPerPerson > 0) {
        const res = await fetch(`/api/endeavors/${id}/checkout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "join" }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
        setJoinMessage(data.error || "Failed to start checkout");
        return;
      }

      // Free join
      const res = await fetch(`/api/endeavors/${id}/join`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setJoinMessage(data.message);
        const updated = await fetch(`/api/endeavors/${id}`);
        if (updated.ok) setEndeavor(await updated.json());
      } else {
        setJoinMessage(data.error || "Failed to join");
      }
    } catch {
      setJoinMessage("Something went wrong");
    } finally {
      setJoining(false);
    }
  }

  async function handleFund() {
    if (!session) return;
    try {
      const res = await fetch(`/api/endeavors/${id}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "donation" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setJoinMessage("Something went wrong");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-medium-gray">
        Loading...
      </div>
    );
  }

  if (!endeavor) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-lg text-medium-gray">Endeavor not found.</p>
          <Link href="/feed" className="text-code-blue hover:text-code-green">
            Back to feed
          </Link>
        </div>
      </div>
    );
  }

  const isCreator = session?.user?.id === endeavor.creatorId;
  const isMember = endeavor.members.some(
    (m) => m.userId === session?.user?.id
  );

  const categoryColors: Record<string, string> = {
    Scientific: "border-code-blue text-code-blue",
    Tech: "border-purple-400 text-purple-400",
    Creative: "border-yellow-400 text-yellow-400",
    Adventure: "border-code-green text-code-green",
    Cultural: "border-orange-400 text-orange-400",
    Community: "border-pink-400 text-pink-400",
  };

  return (
    <div className="min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-medium-gray/30 bg-black/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="text-xl font-bold">
            Endeavor
          </Link>
          <Link
            href="/feed"
            className="text-sm text-code-blue hover:text-code-green"
          >
            Back to Feed
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-8">
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
            <span className="text-xs text-medium-gray">
              {endeavor.joinType === "open" ? "Open join" : "Request to join"}
            </span>
          </div>
          <h1 className="mb-2 text-3xl font-bold md:text-4xl">
            {endeavor.title}
          </h1>
          {endeavor.location && (
            <p className="mb-2 text-sm text-medium-gray">
              {endeavor.location}
            </p>
          )}
          <div className="mb-2 flex items-center gap-3">
            <p className="text-sm text-medium-gray">
              Created by{" "}
              <span className="text-code-blue">{endeavor.creator.name}</span>
            </p>
            <ShareButton
              title={endeavor.title}
              url={typeof window !== "undefined" ? window.location.href : ""}
            />
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-code-green">
                {"// description"}
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-light-gray">
                {endeavor.description}
              </p>
            </div>

            {endeavor.needs && endeavor.needs.length > 0 && (
              <div>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-code-green">
                  {"// what's needed"}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {endeavor.needs.map((need) => (
                    <span
                      key={need}
                      className="border border-medium-gray/30 bg-white/5 px-3 py-1.5 text-sm text-light-gray"
                    >
                      {need}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Members */}
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-code-green">
                {"// crew"} ({endeavor.memberCount})
              </h2>
              <div className="space-y-2">
                {endeavor.members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 border border-medium-gray/20 p-3"
                  >
                    <div className="flex h-8 w-8 items-center justify-center bg-accent text-xs font-bold">
                      {m.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{m.userName}</p>
                      <p className="text-xs text-medium-gray">{m.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Cost */}
            {endeavor.costPerPerson !== null && (
              <div className="border border-medium-gray/30 p-5">
                <p className="mb-1 text-xs uppercase text-medium-gray">
                  Cost to Join
                </p>
                <p className="text-2xl font-bold text-code-green">
                  {endeavor.costPerPerson === 0
                    ? "Free"
                    : `$${endeavor.costPerPerson.toLocaleString()}`}
                </p>
                <p className="text-xs text-medium-gray">per person</p>
              </div>
            )}

            {/* Funding */}
            {endeavor.fundingEnabled && endeavor.fundingGoal && (
              <div className="border border-medium-gray/30 p-5">
                <p className="mb-1 text-xs uppercase text-medium-gray">
                  Crowdfunding
                </p>
                <p className="text-xl font-bold">
                  ${endeavor.fundingRaised.toLocaleString()}
                </p>
                <p className="mb-2 text-xs text-medium-gray">
                  of ${endeavor.fundingGoal.toLocaleString()} goal
                </p>
                <div className="h-2 w-full bg-medium-gray/30">
                  <div
                    className="h-2 bg-code-green"
                    style={{
                      width: `${Math.min(
                        100,
                        (endeavor.fundingRaised / endeavor.fundingGoal) * 100
                      )}%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-xs text-medium-gray">
                  {Math.round(
                    (endeavor.fundingRaised / endeavor.fundingGoal) * 100
                  )}
                  % funded
                </p>
                {session && (
                  <button
                    onClick={handleFund}
                    className="mt-3 w-full border border-code-green px-4 py-2 text-xs font-bold uppercase text-code-green transition-colors hover:bg-code-green hover:text-black"
                  >
                    Fund This Endeavor
                  </button>
                )}
              </div>
            )}

            {/* Capacity */}
            <div className="border border-medium-gray/30 p-5">
              <p className="mb-1 text-xs uppercase text-medium-gray">
                Participants
              </p>
              <p className="text-xl font-bold">
                {endeavor.memberCount}
                {endeavor.capacity && (
                  <span className="text-medium-gray">
                    {" "}
                    / {endeavor.capacity}
                  </span>
                )}
              </p>
              {endeavor.capacity && (
                <p className="text-xs text-medium-gray">
                  {endeavor.capacity - endeavor.memberCount} spots left
                </p>
              )}
            </div>

            {/* Stories link */}
            <Link
              href={`/endeavors/${endeavor.id}/stories`}
              className="block w-full border border-medium-gray/30 px-4 py-3 text-center text-sm text-medium-gray transition-colors hover:border-code-green hover:text-code-green"
            >
              View Stories
            </Link>

            {/* Join button */}
            {joinMessage && (
              <div className="border border-code-green/30 bg-code-green/10 px-4 py-3 text-sm text-code-green">
                {joinMessage}
              </div>
            )}
            {!isCreator && !isMember && session && (
              <button
                onClick={handleJoin}
                disabled={joining}
                className="w-full border border-code-green bg-code-green px-4 py-3 text-sm font-bold uppercase text-black transition-colors hover:bg-transparent hover:text-code-green disabled:opacity-50"
              >
                {joining
                  ? "Joining..."
                  : endeavor.joinType === "open"
                  ? "Join This Endeavor"
                  : "Request to Join"}
              </button>
            )}
            {(isMember || isCreator) && (
              <Link
                href={`/endeavors/${endeavor.id}/dashboard`}
                className="block w-full border border-code-blue bg-code-blue px-4 py-3 text-center text-sm font-bold uppercase text-black transition-colors hover:bg-transparent hover:text-code-blue"
              >
                Open Dashboard
              </Link>
            )}
            {isMember && !isCreator && (
              <div className="border border-code-green/30 p-4 text-center text-sm text-code-green">
                You&apos;re part of this endeavor
              </div>
            )}
            {isCreator && (
              <div className="border border-code-blue/30 p-4 text-center text-sm text-code-blue">
                You created this endeavor
              </div>
            )}
            {!session && (
              <Link
                href="/login"
                className="block w-full border border-code-green px-4 py-3 text-center text-sm font-bold uppercase text-code-green transition-colors hover:bg-code-green hover:text-black"
              >
                Log in to Join
              </Link>
            )}
            {/* Report */}
            {session && !isCreator && (
              <ReportButton endeavorId={endeavor.id} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function ReportButton({ endeavorId }: { endeavorId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleReport() {
    if (!reason.trim()) return;
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endeavorId, reason }),
    });
    if (res.ok) setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="text-center text-xs text-medium-gray">
        Report submitted. Thank you.
      </p>
    );
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-center text-xs text-medium-gray hover:text-red-400"
      >
        Report this endeavor
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-medium-gray/50 bg-black px-3 py-2 text-xs text-white"
          >
            <option value="">Select a reason</option>
            <option value="spam">Spam</option>
            <option value="inappropriate">Inappropriate content</option>
            <option value="scam">Potential scam</option>
            <option value="other">Other</option>
          </select>
          <button
            onClick={handleReport}
            disabled={!reason}
            className="w-full border border-red-500/50 px-3 py-2 text-xs text-red-400 hover:bg-red-500 hover:text-black disabled:opacity-50"
          >
            Submit Report
          </button>
        </div>
      )}
    </div>
  );
}
