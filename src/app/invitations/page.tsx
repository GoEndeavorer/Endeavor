"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { useToast } from "@/components/toast";
import { formatTimeAgo } from "@/lib/time";

type Invitation = {
  id: string;
  sender_id: string;
  sender_name: string;
  sender_image: string | null;
  recipient_name?: string;
  endeavor_id: string | null;
  group_id: string | null;
  type: string;
  message: string | null;
  status: string;
  created_at: string;
};

export default function InvitationsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [tab, setTab] = useState<"received" | "sent">("received");
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    fetch(`/api/invitations?type=${tab}`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setInvitations)
      .finally(() => setLoading(false));
  }, [session, tab]);

  async function respond(invitationId: string, action: "accept" | "decline") {
    setResponding(invitationId);
    const res = await fetch(`/api/invitations/${invitationId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
      toast(action === "accept" ? "Invitation accepted!" : "Invitation declined", "success");
    }
    setResponding(null);
  }

  if (!session) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Invitations", href: "/invitations" }} />
        <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
          <p className="text-sm text-medium-gray">Please log in to view invitations.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Invitations", href: "/invitations" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <h1 className="text-2xl font-bold mb-6">Invitations</h1>

        <div className="flex border border-medium-gray/30 mb-6 w-fit">
          {(["received", "sent"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-xs font-semibold transition-colors ${
                tab === t ? "bg-code-green text-black" : "text-medium-gray hover:text-light-gray"
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-medium-gray">Loading...</p>
        ) : invitations.length === 0 ? (
          <div className="border border-medium-gray/20 p-8 text-center">
            <p className="text-sm text-medium-gray">No {tab} invitations.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invitations.map((inv) => (
              <div key={inv.id} className="border border-medium-gray/20 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-light-gray">
                      {tab === "received" ? (
                        <>
                          <Link href={`/users/${inv.sender_id}`} className="text-code-blue hover:text-code-green">
                            {inv.sender_name}
                          </Link>{" "}
                          invited you to {inv.type === "group" ? "a group" : "an endeavor"}
                        </>
                      ) : (
                        <>
                          Invited {inv.recipient_name || "someone"} · {inv.status}
                        </>
                      )}
                    </p>
                    {inv.message && (
                      <p className="text-xs text-medium-gray mt-1">&quot;{inv.message}&quot;</p>
                    )}
                    <p className="text-xs text-medium-gray mt-1">{formatTimeAgo(inv.created_at)}</p>
                  </div>
                  {tab === "received" && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => respond(inv.id, "accept")}
                        disabled={responding === inv.id}
                        className="px-3 py-1 text-xs font-semibold border border-code-green text-code-green hover:bg-code-green hover:text-black transition-colors disabled:opacity-50"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => respond(inv.id, "decline")}
                        disabled={responding === inv.id}
                        className="px-3 py-1 text-xs font-semibold border border-red-400/50 text-red-400 hover:bg-red-400 hover:text-black transition-colors disabled:opacity-50"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
