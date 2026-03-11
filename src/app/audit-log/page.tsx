"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { formatTimeAgo } from "@/lib/time";

type AuditEntry = {
  id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

const actionIcons: Record<string, string> = {
  login: ">",
  logout: "<",
  create: "+",
  update: "~",
  delete: "x",
  join: "@",
  leave: "-",
  vote: "^",
  comment: "#",
};

export default function AuditLogPage() {
  const { data: session } = useSession();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    if (!session) return;
    const url = filter ? `/api/audit-log?action=${filter}` : "/api/audit-log";
    fetch(url)
      .then((r) => (r.ok ? r.json() : []))
      .then(setEntries)
      .finally(() => setLoading(false));
  }, [session, filter]);

  if (!session) {
    return (
      <div className="min-h-screen">
        <AppHeader breadcrumb={{ label: "Audit Log", href: "/audit-log" }} />
        <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
          <p className="text-sm text-medium-gray">Please log in to view your audit log.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Audit Log", href: "/audit-log" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Audit Log</h1>
            <p className="text-sm text-medium-gray">Your account activity history</p>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-medium-gray/30 bg-black px-3 py-1.5 text-xs text-white"
          >
            <option value="">All actions</option>
            <option value="login">Logins</option>
            <option value="create">Creates</option>
            <option value="update">Updates</option>
            <option value="delete">Deletes</option>
            <option value="join">Joins</option>
            <option value="vote">Votes</option>
          </select>
        </div>

        {loading ? (
          <p className="text-sm text-medium-gray">Loading...</p>
        ) : entries.length === 0 ? (
          <div className="border border-medium-gray/20 p-8 text-center">
            <p className="text-sm text-medium-gray">No audit log entries yet.</p>
          </div>
        ) : (
          <div className="border border-medium-gray/20 divide-y divide-medium-gray/10">
            {entries.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 p-3 hover:bg-medium-gray/5 transition-colors">
                <span className="w-6 h-6 flex items-center justify-center text-xs font-mono text-code-green border border-code-green/20">
                  {actionIcons[entry.action] || "·"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-light-gray">{entry.action}</span>
                    {entry.entity_type && (
                      <span className="text-xs text-medium-gray">
                        on {entry.entity_type}
                        {entry.entity_id ? ` #${entry.entity_id.slice(0, 8)}` : ""}
                      </span>
                    )}
                  </div>
                  {Object.keys(entry.metadata || {}).length > 0 && (
                    <p className="text-xs text-medium-gray/60 font-mono truncate">
                      {JSON.stringify(entry.metadata)}
                    </p>
                  )}
                </div>
                <span className="text-xs text-medium-gray shrink-0">
                  {formatTimeAgo(entry.created_at)}
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
