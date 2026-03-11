"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";

type ReferralData = {
  code: string;
  stats: { completed: number; pending: number; total: number };
  referredUsers: { name: string; image: string | null; status: string; completed_at: string | null }[];
};

export default function ReferralsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!session) return;
    fetch("/api/referrals")
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .finally(() => setLoading(false));
  }, [session]);

  function copyLink() {
    if (!data) return;
    const url = `${window.location.origin}/signup?ref=${data.code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  if (!session) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Referrals", href: "/referrals" }} />
        <main className="mx-auto max-w-3xl px-4 pt-24 pb-16 text-center">
          <p className="text-medium-gray">
            <Link href="/login" className="text-code-blue hover:text-code-green">Log in</Link> to see your referrals.
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Referrals", href: "/referrals" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <h1 className="text-2xl font-bold mb-2">Referrals</h1>
        <p className="text-sm text-medium-gray mb-6">
          Invite friends to Endeavor and grow the community together.
        </p>

        {loading ? (
          <p className="text-sm text-medium-gray">Loading...</p>
        ) : data ? (
          <>
            {/* Referral code */}
            <div className="border border-medium-gray/20 p-6 mb-6">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
                {"// your referral link"}
              </h2>
              <div className="flex items-center gap-3">
                <code className="flex-1 bg-code-green/5 border border-code-green/20 px-4 py-3 text-sm text-code-green font-mono truncate">
                  {typeof window !== "undefined" ? `${window.location.origin}/signup?ref=${data.code}` : data.code}
                </code>
                <button
                  onClick={copyLink}
                  className="shrink-0 px-4 py-3 text-xs font-semibold border border-code-green bg-code-green text-black hover:bg-transparent hover:text-code-green transition-colors"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="mt-2 text-xs text-medium-gray">
                Share this link with friends. When they sign up, you both benefit!
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="border border-medium-gray/20 p-4 text-center">
                <p className="text-2xl font-bold text-code-green">{Number(data.stats.total)}</p>
                <p className="text-xs text-medium-gray mt-1">Total Referrals</p>
              </div>
              <div className="border border-medium-gray/20 p-4 text-center">
                <p className="text-2xl font-bold text-code-blue">{Number(data.stats.completed)}</p>
                <p className="text-xs text-medium-gray mt-1">Completed</p>
              </div>
              <div className="border border-medium-gray/20 p-4 text-center">
                <p className="text-2xl font-bold text-yellow-400">{Number(data.stats.pending)}</p>
                <p className="text-xs text-medium-gray mt-1">Pending</p>
              </div>
            </div>

            {/* Referred users */}
            {data.referredUsers.length > 0 && (
              <div>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-code-green">
                  {"// referred users"}
                </h2>
                <div className="space-y-2">
                  {data.referredUsers.map((u, i) => (
                    <div key={i} className="flex items-center justify-between border border-medium-gray/20 p-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center bg-code-green/10 border border-code-green/30 text-xs font-bold text-code-green">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm">{u.name}</span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 border ${
                        u.status === "completed"
                          ? "text-code-green border-code-green/30"
                          : "text-yellow-400 border-yellow-400/30"
                      }`}>
                        {u.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.referredUsers.length === 0 && (
              <div className="border border-medium-gray/20 p-8 text-center">
                <p className="text-sm text-medium-gray">
                  No referrals yet. Share your link to get started!
                </p>
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-medium-gray">Unable to load referral data.</p>
        )}
      </main>
      <Footer />
    </div>
  );
}
