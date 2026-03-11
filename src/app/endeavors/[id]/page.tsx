"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { ShareButton } from "@/components/share-button";
import { AppHeader } from "@/components/app-header";
import { analytics } from "@/lib/analytics";

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
  imageUrl: string | null;
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
  const [bookmarked, setBookmarked] = useState(false);
  const [similar, setSimilar] = useState<{ id: string; title: string; category: string; status: string; imageUrl: string | null; memberCount: number }[]>([]);

  useEffect(() => {
    async function fetchEndeavor() {
      try {
        const res = await fetch(`/api/endeavors/${id}`);
        if (res.ok) {
          const data = await res.json();
          setEndeavor(data);
          analytics.endeavorViewed(id, data.category);
        }
      } catch (err) {
        console.error("Failed to fetch endeavor:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEndeavor();
  }, [id]);

  // Fetch similar endeavors
  useEffect(() => {
    fetch(`/api/endeavors/${id}/similar`)
      .then((r) => r.ok ? r.json() : [])
      .then(setSimilar)
      .catch(() => {});
  }, [id]);

  // Check bookmark status
  useEffect(() => {
    if (!session) return;
    fetch("/api/bookmarks")
      .then((r) => r.ok ? r.json() : [])
      .then((data: { endeavorId: string }[]) => {
        if (Array.isArray(data)) {
          setBookmarked(data.some((b) => b.endeavorId === id));
        }
      })
      .catch(() => {});
  }, [session, id]);

  async function toggleBookmark() {
    const res = await fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endeavorId: id }),
    });
    if (res.ok) {
      const data = await res.json();
      setBookmarked(data.bookmarked);
    }
  }

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
      <AppHeader breadcrumb={{ label: endeavor.title, href: `/endeavors/${endeavor.id}` }} />

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16">
        {/* Cover Image */}
        {endeavor.imageUrl && (
          <div className="mb-6 overflow-hidden border border-medium-gray/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={endeavor.imageUrl}
              alt={endeavor.title}
              className="h-64 w-full object-cover md:h-80"
            />
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-2">
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
            <span className={`text-xs font-semibold ${
              endeavor.status === "open" ? "text-code-green" :
              endeavor.status === "in-progress" ? "text-code-blue" :
              endeavor.status === "completed" ? "text-purple-400" :
              endeavor.status === "cancelled" ? "text-red-400" :
              "text-medium-gray"
            }`}>
              {endeavor.status === "in-progress" ? "In Progress" :
               endeavor.status.charAt(0).toUpperCase() + endeavor.status.slice(1)}
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
              <Link
                href={`/users/${endeavor.creator.id}`}
                className="text-code-blue hover:text-code-green"
              >
                {endeavor.creator.name}
              </Link>
            </p>
            <span className="text-xs text-medium-gray">
              {new Date(endeavor.createdAt).toLocaleDateString()}
            </span>
            <ShareButton
              title={endeavor.title}
              url={typeof window !== "undefined" ? window.location.href : ""}
            />
            {session && (
              <button
                onClick={toggleBookmark}
                className={`text-xs transition-colors ${
                  bookmarked
                    ? "text-yellow-400 hover:text-yellow-300"
                    : "text-medium-gray hover:text-yellow-400"
                }`}
                title={bookmarked ? "Remove bookmark" : "Bookmark"}
              >
                {bookmarked ? "[saved]" : "[save]"}
              </button>
            )}
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
                  <Link
                    key={m.id}
                    href={`/users/${m.userId}`}
                    className="flex items-center gap-3 border border-medium-gray/20 p-3 transition-colors hover:border-code-green/30"
                  >
                    <div className="flex h-8 w-8 items-center justify-center bg-accent text-xs font-bold">
                      {m.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{m.userName}</p>
                      <p className="text-xs text-medium-gray">{m.role}</p>
                    </div>
                  </Link>
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

            {/* Duplicate / Template */}
            {session && (
              <button
                onClick={async () => {
                  const res = await fetch(`/api/endeavors/${id}/duplicate`, { method: "POST" });
                  if (res.ok) {
                    const data = await res.json();
                    window.location.href = `/endeavors/${data.id}/dashboard`;
                  }
                }}
                className="w-full border border-medium-gray/30 px-4 py-3 text-center text-sm text-medium-gray transition-colors hover:border-code-green hover:text-code-green"
              >
                Use as Template
              </button>
            )}

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
              <div className="space-y-2">
                <div className="border border-code-green/30 p-4 text-center text-sm text-code-green">
                  You&apos;re part of this endeavor
                </div>
                <LeaveButton endeavorId={endeavor.id} onLeave={() => {
                  fetch(`/api/endeavors/${id}`).then(r => r.json()).then(setEndeavor);
                  setJoinMessage("You have left this endeavor.");
                }} />
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

        {/* Similar endeavors */}
        {similar.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-code-green">
              {"// similar endeavors"}
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {similar.map((s) => (
                <Link
                  key={s.id}
                  href={`/endeavors/${s.id}`}
                  className="group border border-medium-gray/30 overflow-hidden transition-colors hover:border-code-green/50"
                >
                  {s.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.imageUrl} alt="" className="h-24 w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-24 items-center justify-center bg-code-green/5 text-3xl font-bold text-code-green/20">
                      {s.title.charAt(0)}
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-sm font-semibold truncate group-hover:text-code-green transition-colors">
                      {s.title}
                    </p>
                    <p className="text-xs text-medium-gray mt-1">
                      {s.category} &middot; {s.memberCount} joined
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function LeaveButton({ endeavorId, onLeave }: { endeavorId: string; onLeave: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [leaving, setLeaving] = useState(false);

  async function handleLeave() {
    setLeaving(true);
    const res = await fetch(`/api/endeavors/${endeavorId}/leave`, { method: "POST" });
    if (res.ok) {
      onLeave();
    }
    setLeaving(false);
    setConfirming(false);
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="w-full text-center text-xs text-medium-gray hover:text-red-400"
      >
        Leave this endeavor
      </button>
    );
  }

  return (
    <div className="flex justify-center gap-2">
      <button
        onClick={handleLeave}
        disabled={leaving}
        className="border border-red-500/50 px-3 py-1 text-xs text-red-400 hover:bg-red-500 hover:text-black disabled:opacity-50"
      >
        {leaving ? "Leaving..." : "Confirm Leave"}
      </button>
      <button
        onClick={() => setConfirming(false)}
        className="px-3 py-1 text-xs text-medium-gray hover:text-white"
      >
        Cancel
      </button>
    </div>
  );
}

function ReportButton({ endeavorId }: { endeavorId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function handleReport() {
    if (!reason.trim()) return;
    const res = await fetch(`/api/endeavors/${endeavorId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
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
