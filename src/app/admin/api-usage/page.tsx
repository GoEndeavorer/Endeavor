"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

type EndpointStat = {
  path: string;
  method: string;
  requests: number;
  avgResponseMs: number;
  errorRate: number;
  lastCalled: string;
};

type ApiUsageStats = {
  totalRoutes: number;
  requestsToday: number;
  avgResponseMs: number;
  errorRate: number;
  uptimePercent: number;
  topEndpoints: EndpointStat[];
  requestsByHour: { hour: string; count: number }[];
};

const METHOD_COLORS: Record<string, string> = {
  GET: "text-code-green",
  POST: "text-code-blue",
  PATCH: "text-yellow-400",
  PUT: "text-orange-400",
  DELETE: "text-red-400",
};

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="border border-medium-gray/20 bg-black/40 p-5">
      <p className="mb-1 font-mono text-[10px] uppercase tracking-widest text-medium-gray">{label}</p>
      <p className={`font-mono text-3xl font-bold ${accent || "text-white"}`}>{value}</p>
      {sub && <p className="mt-1 font-mono text-xs text-medium-gray">{sub}</p>}
    </div>
  );
}

function MiniBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="h-1.5 w-24 bg-medium-gray/20">
      <div
        className="h-full bg-code-green/70 transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function TrafficChart({ data }: { data: { hour: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  return (
    <div className="flex items-end gap-[2px]" style={{ height: 80 }}>
      {data.map((d, i) => {
        const pct = (d.count / max) * 100;
        return (
          <div
            key={i}
            className="group relative flex-1 cursor-default bg-code-blue/40 transition-colors hover:bg-code-blue/80"
            style={{ height: `${pct}%`, minWidth: 2 }}
            title={`${d.hour}: ${d.count.toLocaleString()} req`}
          >
            <div className="pointer-events-none absolute -top-8 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap border border-medium-gray/40 bg-black px-2 py-0.5 font-mono text-[9px] text-light-gray group-hover:block">
              {d.hour} &mdash; {d.count.toLocaleString()}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ApiUsagePage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [stats, setStats] = useState<ApiUsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (!session) return;

    fetch("/api/admin/api-usage")
      .then((r) => {
        if (!r.ok) throw new Error("Forbidden");
        return r.json();
      })
      .then((data) => setStats(data))
      .catch((err) => {
        setError(
          err.message === "Forbidden"
            ? "You do not have admin access."
            : "Failed to load API usage data."
        );
      })
      .finally(() => setLoading(false));
  }, [session]);

  if (isPending || loading) {
    return (
      <div className="min-h-screen">
        <div className="h-16 border-b border-medium-gray/30 bg-black/95" />
        <main className="mx-auto max-w-5xl px-4 pt-24 pb-16">
          <div className="mb-6 h-8 w-64 animate-pulse bg-medium-gray/10" />
          <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse bg-medium-gray/10" />
            ))}
          </div>
          <div className="mb-8 h-24 animate-pulse bg-medium-gray/10" />
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse bg-medium-gray/10" />
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

  if (!stats) return null;

  const maxRequests = Math.max(...stats.topEndpoints.map((e) => e.requests), 1);

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "API Usage", href: "/admin/api-usage" }} />

      <main className="mx-auto max-w-5xl px-4 pt-24 pb-16">
        {/* Header */}
        <div className="mb-6">
          <Link href="/admin" className="mb-1 block text-xs text-medium-gray hover:text-code-green">
            &larr; Admin Dashboard
          </Link>
          <h1 className="font-mono text-3xl font-bold">
            <span className="text-code-green">$</span> api-usage <span className="animate-pulse text-code-green">_</span>
          </h1>
          <p className="mt-1 font-mono text-xs text-medium-gray">
            Platform API performance and traffic metrics
          </p>
        </div>

        {/* Stat Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            label="Total Routes"
            value={stats.totalRoutes.toString()}
            sub="registered endpoints"
            accent="text-code-blue"
          />
          <StatCard
            label="Requests Today"
            value={stats.requestsToday.toLocaleString()}
            sub="across all endpoints"
            accent="text-code-green"
          />
          <StatCard
            label="Avg Response"
            value={`${stats.avgResponseMs}ms`}
            sub="p50 latency"
            accent="text-white"
          />
          <StatCard
            label="Error Rate"
            value={`${stats.errorRate}%`}
            sub={`uptime ${stats.uptimePercent}%`}
            accent={stats.errorRate > 2 ? "text-red-400" : "text-code-green"}
          />
        </div>

        {/* Traffic Chart */}
        <div className="mb-8 border border-medium-gray/20 bg-black/40 p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-widest text-medium-gray">
              Requests / Hour (24h)
            </p>
            <p className="font-mono text-[10px] text-medium-gray">
              peak: {Math.max(...stats.requestsByHour.map((h) => h.count)).toLocaleString()} req/h
            </p>
          </div>
          <TrafficChart data={stats.requestsByHour} />
          <div className="mt-1 flex justify-between font-mono text-[9px] text-medium-gray/60">
            <span>{stats.requestsByHour[0]?.hour}</span>
            <span>{stats.requestsByHour[Math.floor(stats.requestsByHour.length / 2)]?.hour}</span>
            <span>{stats.requestsByHour[stats.requestsByHour.length - 1]?.hour}</span>
          </div>
        </div>

        {/* Top Endpoints Table */}
        <div className="border border-medium-gray/20 bg-black/40">
          <div className="border-b border-medium-gray/20 px-5 py-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-medium-gray">
              Top Endpoints by Request Volume
            </p>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-[60px_1fr_100px_90px_80px_100px] gap-2 border-b border-medium-gray/10 px-5 py-2 font-mono text-[10px] uppercase tracking-wider text-medium-gray">
            <span>Method</span>
            <span>Endpoint</span>
            <span className="text-right">Requests</span>
            <span className="text-right">Avg (ms)</span>
            <span className="text-right">Errors</span>
            <span>Volume</span>
          </div>

          {/* Table Rows */}
          {stats.topEndpoints.map((ep, i) => (
            <div
              key={i}
              className="grid grid-cols-[60px_1fr_100px_90px_80px_100px] items-center gap-2 border-b border-medium-gray/10 px-5 py-3 transition-colors last:border-b-0 hover:bg-medium-gray/5"
            >
              <span className={`font-mono text-xs font-bold ${METHOD_COLORS[ep.method] || "text-white"}`}>
                {ep.method}
              </span>
              <span className="truncate font-mono text-sm text-light-gray">
                {ep.path}
              </span>
              <span className="text-right font-mono text-sm text-white">
                {ep.requests.toLocaleString()}
              </span>
              <span className={`text-right font-mono text-sm ${ep.avgResponseMs > 100 ? "text-yellow-400" : "text-medium-gray"}`}>
                {ep.avgResponseMs}
              </span>
              <span className={`text-right font-mono text-sm ${ep.errorRate > 1 ? "text-red-400" : "text-medium-gray"}`}>
                {ep.errorRate}%
              </span>
              <MiniBar value={ep.requests} max={maxRequests} />
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-6 border border-dashed border-medium-gray/20 px-5 py-3">
          <p className="font-mono text-[10px] leading-relaxed text-medium-gray">
            <span className="text-yellow-400">NOTE:</span>{" "}
            Data shown is simulated. To enable real API logging, add request middleware
            that writes to the <span className="text-code-blue">request_log</span> table
            with path, method, status, and response time fields.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
