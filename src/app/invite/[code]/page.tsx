"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

type InviteData = {
  endeavorId: string;
  endeavorTitle: string;
  endeavorCategory: string;
  endeavorImage: string | null;
  inviterName: string;
  memberCount: number;
};

export default function InvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    fetch(`/api/invite/${code}`)
      .then((r) => {
        if (!r.ok) throw new Error("Invalid invite");
        return r.json();
      })
      .then(setInvite)
      .catch(() => setError("This invite link is invalid or has expired."))
      .finally(() => setLoading(false));
  }, [code]);

  const handleJoin = async () => {
    if (!session) {
      router.push(`/login?redirect=/invite/${code}`);
      return;
    }

    setJoining(true);
    try {
      const res = await fetch(`/api/invite/${code}/accept`, {
        method: "POST",
      });

      if (res.ok) {
        const data = await res.json();
        setJoined(true);
        setTimeout(() => router.push(`/endeavors/${data.endeavorId}/dashboard`), 1500);
      } else {
        const err = await res.json();
        setError(err.error || "Failed to join");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Invite", href: `/invite/${code}` }} />
      <main className="mx-auto max-w-lg px-4 pt-24 pb-16">
        {loading ? (
          <div className="space-y-4">
            <div className="h-48 animate-pulse bg-medium-gray/10 border border-medium-gray/10" />
            <div className="h-6 w-2/3 animate-pulse bg-medium-gray/10" />
            <div className="h-10 w-full animate-pulse bg-medium-gray/10" />
          </div>
        ) : error && !invite ? (
          <div className="border border-red-400/30 p-8 text-center">
            <p className="text-2xl mb-3">!</p>
            <p className="text-sm text-red-400 mb-4">{error}</p>
            <Link href="/feed" className="text-xs text-code-green hover:underline">
              Browse endeavors instead
            </Link>
          </div>
        ) : invite ? (
          <div className="border border-medium-gray/20 overflow-hidden">
            {invite.endeavorImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={invite.endeavorImage}
                alt=""
                className="h-48 w-full object-cover"
              />
            ) : (
              <div className="flex h-48 items-center justify-center bg-code-green/5 text-6xl font-bold text-code-green/20">
                {invite.endeavorTitle.charAt(0)}
              </div>
            )}
            <div className="p-6">
              <p className="mb-1 text-xs text-medium-gray">
                {invite.inviterName} invited you to join
              </p>
              <h1 className="mb-2 text-2xl font-bold">{invite.endeavorTitle}</h1>
              <div className="mb-6 flex items-center gap-3 text-xs text-medium-gray">
                <span className="border border-code-green/30 px-2 py-0.5 text-code-green">
                  {invite.endeavorCategory}
                </span>
                <span>{invite.memberCount} members</span>
              </div>

              {joined ? (
                <div className="border border-code-green/30 bg-code-green/10 p-4 text-center">
                  <p className="text-sm font-semibold text-code-green">
                    You&apos;ve joined! Redirecting...
                  </p>
                </div>
              ) : (
                <>
                  {error && (
                    <p className="mb-3 text-xs text-red-400">{error}</p>
                  )}
                  <button
                    onClick={handleJoin}
                    disabled={joining}
                    className="w-full border border-code-green bg-code-green py-3 text-sm font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {joining
                      ? "Joining..."
                      : session
                        ? "Join This Endeavor"
                        : "Log In to Join"}
                  </button>
                  <p className="mt-3 text-center text-xs text-medium-gray">
                    or{" "}
                    <Link
                      href={`/endeavors/${invite.endeavorId}`}
                      className="text-code-blue hover:underline"
                    >
                      view details first
                    </Link>
                  </p>
                </>
              )}
            </div>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}
