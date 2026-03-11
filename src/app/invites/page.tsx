"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useSession } from "@/lib/auth-client";
import { formatTimeAgo } from "@/lib/time";

type SentInvite = {
  id: string;
  endeavor_id: string;
  code: string;
  max_uses: number | null;
  uses: number;
  expires_at: string | null;
  created_at: string;
  endeavor_title: string;
};

type ReceivedInvite = {
  id: string;
  endeavor_id: string;
  code: string;
  created_at: string;
  endeavor_title: string;
  endeavor_category: string;
  endeavor_image: string | null;
  inviter_name: string;
};

export default function InvitesPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [sent, setSent] = useState<SentInvite[]>([]);
  const [received, setReceived] = useState<ReceivedInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"received" | "sent">("received");

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  useEffect(() => {
    if (!session) return;
    fetch("/api/invites")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setSent(data.sent || []);
          setReceived(data.received || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [session]);

  if (isPending || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center text-medium-gray">
        <span className="animate-pulse font-mono text-sm">loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Invitations", href: "/invites" }} />
      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <h1 className="text-xl font-bold mb-2">Invitations</h1>
        <p className="text-sm text-medium-gray mb-8">
          Manage invitations you&apos;ve sent and received.
        </p>

        {/* tabs */}
        <div className="flex gap-4 mb-6 border-b border-medium-gray/20">
          <button
            onClick={() => setTab("received")}
            className={`pb-2 text-xs font-semibold uppercase tracking-widest transition-colors ${
              tab === "received"
                ? "text-code-green border-b-2 border-code-green"
                : "text-medium-gray hover:text-light-gray"
            }`}
          >
            Received ({received.length})
          </button>
          <button
            onClick={() => setTab("sent")}
            className={`pb-2 text-xs font-semibold uppercase tracking-widest transition-colors ${
              tab === "sent"
                ? "text-code-green border-b-2 border-code-green"
                : "text-medium-gray hover:text-light-gray"
            }`}
          >
            Sent ({sent.length})
          </button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse bg-medium-gray/10 border border-medium-gray/20" />
            ))}
          </div>
        ) : tab === "received" ? (
          received.length === 0 ? (
            <div className="border border-medium-gray/20 p-8 text-center">
              <p className="text-sm text-medium-gray mb-3">No invitations received yet.</p>
              <Link href="/discover" className="text-xs text-code-blue hover:text-code-green transition-colors">
                Discover endeavors &rarr;
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {received.map((inv) => (
                <Link
                  key={inv.id}
                  href={`/endeavors/${inv.endeavor_id}`}
                  className="flex items-center gap-3 border border-medium-gray/20 p-4 transition-colors hover:border-code-green/30"
                >
                  {inv.endeavor_image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={inv.endeavor_image} alt="" className="h-10 w-12 shrink-0 object-cover" />
                  ) : (
                    <div className="flex h-10 w-12 shrink-0 items-center justify-center bg-code-green/10 text-xs font-bold text-code-green">
                      {inv.endeavor_title.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{inv.endeavor_title}</p>
                    <p className="text-xs text-medium-gray">
                      Invited by {inv.inviter_name} &middot; {inv.endeavor_category}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-medium-gray">
                    {formatTimeAgo(inv.created_at)}
                  </span>
                </Link>
              ))}
            </div>
          )
        ) : sent.length === 0 ? (
          <div className="border border-medium-gray/20 p-8 text-center">
            <p className="text-sm text-medium-gray mb-3">You haven&apos;t sent any invitations yet.</p>
            <Link href="/my-endeavors" className="text-xs text-code-blue hover:text-code-green transition-colors">
              Manage your endeavors &rarr;
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {sent.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center gap-3 border border-medium-gray/20 p-4"
              >
                <span className="font-mono text-sm font-bold text-code-blue shrink-0">&gt;</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{inv.endeavor_title}</p>
                  <p className="text-xs text-medium-gray">
                    Code: <span className="font-mono text-code-green">{inv.code}</span>
                    {inv.max_uses && (
                      <> &middot; {inv.uses}/{inv.max_uses} uses</>
                    )}
                    {inv.expires_at && (
                      <> &middot; Expires {new Date(inv.expires_at).toLocaleDateString()}</>
                    )}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-medium-gray">
                  {formatTimeAgo(inv.created_at)}
                </span>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
