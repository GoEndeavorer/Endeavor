"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import { formatTimeAgo } from "@/lib/time";

type Report = {
  id: string;
  targetType: string;
  targetId: string;
  reason: string;
  description: string | null;
  status: string;
  createdAt: string;
  resolvedAt: string | null;
  reporterName: string;
  reporterEmail: string;
  targetTitle: string | null;
};

type StatusFilter = "all" | "pending" | "reviewed" | "resolved" | "dismissed";

const STATUS_CONFIG: Record<string, { label: string; color: string; border: string; bg: string }> = {
  pending: { label: "Pending", color: "text-yellow-400", border: "border-yellow-500/40", bg: "bg-yellow-500/10" },
  reviewed: { label: "Reviewed", color: "text-code-blue", border: "border-code-blue/40", bg: "bg-code-blue/10" },
  resolved: { label: "Resolved", color: "text-code-green", border: "border-code-green/40", bg: "bg-code-green/10" },
  dismissed: { label: "Dismissed", color: "text-medium-gray", border: "border-medium-gray/40", bg: "bg-medium-gray/10" },
};

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${config.color} ${config.border} ${config.bg} border`}>
      {config.label}
    </span>
  );
}

function targetLink(type: string, id: string): string {
  if (type === "endeavor") return `/endeavors/${id}`;
  if (type === "user") return `/users/${id}`;
  if (type === "discussion") return `/discussions/${id}`;
  return "#";
}

export default function ModerationPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (!session) return;

    fetch("/api/admin/reports")
      .then((r) => {
        if (!r.ok) throw new Error("Forbidden");
        return r.json();
      })
      .then((data) => setReports(data))
      .catch((err) => {
        setError(
          err.message === "Forbidden"
            ? "You do not have admin access."
            : "Failed to load reports."
        );
      })
      .finally(() => setLoading(false));
  }, [session]);

  async function updateReport(reportId: string, status: string) {
    setUpdatingId(reportId);
    const res = await fetch("/api/admin/reports", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, status }),
    });
    if (res.ok) {
      setReports(
        reports.map((r) =>
          r.id === reportId
            ? { ...r, status, resolvedAt: status === "resolved" || status === "dismissed" ? new Date().toISOString() : r.resolvedAt }
            : r
        )
      );
    }
    setUpdatingId(null);
  }

  if (isPending || loading) {
    return (
      <div className="min-h-screen">
        <div className="h-16 border-b border-medium-gray/30 bg-black/95" />
        <main className="mx-auto max-w-5xl px-4 pt-24 pb-16">
          <div className="mb-6 h-8 w-64 animate-pulse bg-medium-gray/10" />
          <div className="mb-6 flex gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-9 w-24 animate-pulse bg-medium-gray/10" />
            ))}
          </div>
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-24 w-full animate-pulse bg-medium-gray/10" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-lg text-red-400">{error}</p>
          <Link href="/admin" className="text-code-blue hover:text-code-green">
            Back to Admin
          </Link>
        </div>
      </div>
    );
  }

  const filtered = filter === "all" ? reports : reports.filter((r) => r.status === filter);
  const counts: Record<StatusFilter, number> = {
    all: reports.length,
    pending: reports.filter((r) => r.status === "pending").length,
    reviewed: reports.filter((r) => r.status === "reviewed").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    dismissed: reports.filter((r) => r.status === "dismissed").length,
  };

  const filters: { id: StatusFilter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "reviewed", label: "Reviewed" },
    { id: "resolved", label: "Resolved" },
    { id: "dismissed", label: "Dismissed" },
  ];

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Moderation", href: "/admin/moderation" }} />

      <main className="mx-auto max-w-5xl px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/admin" className="mb-1 block text-xs text-medium-gray hover:text-code-green">
              &larr; Admin Dashboard
            </Link>
            <h1 className="text-3xl font-bold">Content Moderation</h1>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-yellow-400">{counts.pending}</p>
            <p className="text-xs text-medium-gray">pending review</p>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`whitespace-nowrap border px-4 py-2 text-xs font-semibold uppercase transition-colors ${
                filter === f.id
                  ? "border-code-green bg-code-green text-black"
                  : "border-medium-gray/50 text-medium-gray hover:border-code-green hover:text-code-green"
              }`}
            >
              {f.label} ({counts[f.id]})
            </button>
          ))}
        </div>

        {/* Reports List */}
        {filtered.length === 0 ? (
          <div className="border border-medium-gray/20 p-8 text-center text-sm text-medium-gray">
            {filter === "all"
              ? "No reports yet."
              : `No ${filter} reports.`}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((r) => {
              const statusConfig = STATUS_CONFIG[r.status] || STATUS_CONFIG.pending;
              return (
                <div
                  key={r.id}
                  className={`border p-4 transition-colors ${
                    r.status === "pending"
                      ? "border-yellow-500/30"
                      : r.status === "reviewed"
                        ? "border-code-blue/30"
                        : "border-medium-gray/20"
                  } ${r.status === "dismissed" ? "opacity-50" : ""}`}
                >
                  {/* Top row: reason + status + actions */}
                  <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <StatusBadge status={r.status} />
                      <span className={`text-sm font-semibold ${statusConfig.color}`}>
                        {r.reason}
                      </span>
                      <span className="text-xs text-medium-gray">
                        {r.targetType}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {r.status === "pending" && (
                        <>
                          <button
                            onClick={() => updateReport(r.id, "reviewed")}
                            disabled={updatingId === r.id}
                            className="border border-code-blue px-3 py-1 text-xs text-code-blue transition-colors hover:bg-code-blue hover:text-black disabled:opacity-50"
                          >
                            Review
                          </button>
                          <button
                            onClick={() => updateReport(r.id, "resolved")}
                            disabled={updatingId === r.id}
                            className="border border-code-green px-3 py-1 text-xs text-code-green transition-colors hover:bg-code-green hover:text-black disabled:opacity-50"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => updateReport(r.id, "dismissed")}
                            disabled={updatingId === r.id}
                            className="border border-medium-gray/50 px-3 py-1 text-xs text-medium-gray transition-colors hover:text-white disabled:opacity-50"
                          >
                            Dismiss
                          </button>
                        </>
                      )}
                      {r.status === "reviewed" && (
                        <>
                          <button
                            onClick={() => updateReport(r.id, "resolved")}
                            disabled={updatingId === r.id}
                            className="border border-code-green px-3 py-1 text-xs text-code-green transition-colors hover:bg-code-green hover:text-black disabled:opacity-50"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => updateReport(r.id, "dismissed")}
                            disabled={updatingId === r.id}
                            className="border border-medium-gray/50 px-3 py-1 text-xs text-medium-gray transition-colors hover:text-white disabled:opacity-50"
                          >
                            Dismiss
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Target title */}
                  {r.targetTitle && (
                    <div className="mb-2">
                      <Link
                        href={targetLink(r.targetType, r.targetId)}
                        className="text-sm text-code-blue hover:text-code-green"
                      >
                        {r.targetTitle}
                      </Link>
                    </div>
                  )}

                  {/* Description */}
                  {r.description && (
                    <p className="mb-2 text-xs leading-relaxed text-light-gray">
                      {r.description}
                    </p>
                  )}

                  {/* Footer: reporter + time */}
                  <div className="flex flex-wrap items-center gap-x-3 text-xs text-medium-gray">
                    <span>
                      Reported by{" "}
                      <span className="font-semibold text-light-gray">
                        {r.reporterName}
                      </span>{" "}
                      ({r.reporterEmail})
                    </span>
                    <span>&middot;</span>
                    <span>{formatTimeAgo(r.createdAt)}</span>
                    {r.resolvedAt && (
                      <>
                        <span>&middot;</span>
                        <span>
                          {r.status === "dismissed" ? "Dismissed" : "Resolved"}{" "}
                          {formatTimeAgo(r.resolvedAt)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
