"use client";

import { useState, useEffect, useCallback } from "react";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

type StatusResponse = {
  status: "ok" | "degraded";
  database: "connected" | "disconnected";
  apiVersion: string;
  uptime: number;
  lastChecked: string;
  stats: {
    totalEndeavors: number;
    totalUsers: number;
  };
};

type Service = {
  name: string;
  status: "operational" | "checking" | "down";
  latency?: number;
};

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function StatusDot({ status }: { status: "operational" | "checking" | "down" }) {
  return (
    <span
      className={`inline-block h-2 w-2 ${
        status === "operational"
          ? "bg-[#00FF00]"
          : status === "checking"
          ? "bg-[#666666] animate-pulse"
          : "bg-red-500"
      }`}
    />
  );
}

export default function StatusPage() {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [apiLatency, setApiLatency] = useState<number | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [services, setServices] = useState<Service[]>([
    { name: "API", status: "checking" },
    { name: "Database", status: "checking" },
    { name: "Authentication", status: "checking" },
  ]);

  const fetchStatus = useCallback(async () => {
    const start = performance.now();
    try {
      const res = await fetch("/api/status");
      const latency = Math.round(performance.now() - start);
      setApiLatency(latency);
      setLastRefresh(new Date());

      if (res.ok) {
        const json: StatusResponse = await res.json();
        setData(json);
        setServices([
          { name: "API", status: "operational", latency },
          {
            name: "Database",
            status: json.database === "connected" ? "operational" : "down",
            latency,
          },
          { name: "Authentication", status: "operational" },
        ]);
      } else {
        setServices((prev) =>
          prev.map((s) => ({ ...s, status: "down" as const }))
        );
      }
    } catch {
      setServices((prev) =>
        prev.map((s) => ({ ...s, status: "down" as const }))
      );
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const allOperational = services.every((s) => s.status === "operational");
  const anyChecking = services.some((s) => s.status === "checking");

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Status", href: "/status" }} />

      <main className="mx-auto max-w-xl px-4 pt-24 pb-16">
        {/* Page title */}
        <h1 className="mb-1 text-3xl font-bold">System Status</h1>
        <p className="mb-8 text-sm text-[#666666]">
          Real-time operational status of Endeavor platform services. Auto-refreshes every 30s.
        </p>

        {/* Overall status banner */}
        <div
          className={`mb-10 border p-6 text-center ${
            allOperational
              ? "border-[#00FF00]/30 bg-[#00FF00]/5"
              : anyChecking
              ? "border-[#666666]/30 bg-[#666666]/5"
              : "border-red-500/30 bg-red-500/5"
          }`}
        >
          <p
            className={`text-lg font-semibold ${
              allOperational
                ? "text-[#00FF00]"
                : anyChecking
                ? "text-[#666666]"
                : "text-red-400"
            }`}
          >
            {allOperational
              ? "All Systems Operational"
              : anyChecking
              ? "Checking Systems..."
              : "Some Services Experiencing Issues"}
          </p>
          {lastRefresh && (
            <p className="mt-1 text-xs text-[#666666]">
              Last checked: {lastRefresh.toLocaleString()}
            </p>
          )}
        </div>

        {/* // services */}
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#00FF00]">
          {"// services"}
        </p>
        <div className="space-y-2">
          {services.map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between border border-[#666666]/20 p-4"
            >
              <span className="text-sm">{service.name}</span>
              <div className="flex items-center gap-3">
                {service.latency !== undefined && (
                  <span className="text-xs font-mono text-[#666666]">
                    {service.latency}ms
                  </span>
                )}
                <span
                  className={`flex items-center gap-1.5 text-xs font-semibold ${
                    service.status === "operational"
                      ? "text-[#00FF00]"
                      : service.status === "checking"
                      ? "text-[#666666]"
                      : "text-red-400"
                  }`}
                >
                  <StatusDot status={service.status} />
                  {service.status === "operational"
                    ? "Operational"
                    : service.status === "checking"
                    ? "Checking"
                    : "Down"}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* // health checks */}
        <p className="mt-12 mb-4 text-xs font-semibold uppercase tracking-widest text-[#00FF00]">
          {"// health checks"}
        </p>
        <div className="space-y-2">
          {/* Database Connectivity */}
          <div className="flex items-center justify-between border border-[#666666]/20 p-4">
            <div className="flex items-center gap-3">
              <span
                className={`h-3 w-3 rounded-full ${
                  data?.database === "connected"
                    ? "bg-[#00FF00]"
                    : data === null
                    ? "bg-[#666666] animate-pulse"
                    : "bg-red-400"
                }`}
              />
              <span className="text-sm font-medium">Database Connectivity</span>
            </div>
            <span
              className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                data?.database === "connected"
                  ? "bg-[#00FF00]/10 text-[#00FF00]"
                  : data === null
                  ? "bg-[#666666]/10 text-[#666666]"
                  : "bg-red-400/10 text-red-400"
              }`}
            >
              {data?.database === "connected"
                ? "Connected"
                : data === null
                ? "Checking..."
                : "Error"}
            </span>
          </div>

          {/* API Response Time */}
          <div className="flex items-center justify-between border border-[#666666]/20 p-4">
            <div className="flex items-center gap-3">
              <span
                className={`h-3 w-3 rounded-full ${
                  apiLatency !== null && apiLatency < 1000
                    ? "bg-[#00FF00]"
                    : apiLatency === null
                    ? "bg-[#666666] animate-pulse"
                    : "bg-red-400"
                }`}
              />
              <span className="text-sm font-medium">API Response Time</span>
            </div>
            <span
              className={`rounded-full px-3 py-0.5 text-xs font-semibold font-mono ${
                apiLatency !== null && apiLatency < 1000
                  ? "bg-[#00FF00]/10 text-[#00FF00]"
                  : apiLatency === null
                  ? "bg-[#666666]/10 text-[#666666]"
                  : "bg-red-400/10 text-red-400"
              }`}
            >
              {apiLatency !== null ? `${apiLatency}ms` : "Measuring..."}
            </span>
          </div>

          {/* Uptime */}
          <div className="flex items-center justify-between border border-[#666666]/20 p-4">
            <div className="flex items-center gap-3">
              <span
                className={`h-3 w-3 rounded-full ${
                  data ? "bg-[#00FF00]" : "bg-[#666666] animate-pulse"
                }`}
              />
              <span className="text-sm font-medium">Server Uptime</span>
            </div>
            <span
              className={`rounded-full px-3 py-0.5 text-xs font-semibold font-mono ${
                data
                  ? "bg-[#00FF00]/10 text-[#00FF00]"
                  : "bg-[#666666]/10 text-[#666666]"
              }`}
            >
              {data ? formatUptime(data.uptime) : "Checking..."}
            </span>
          </div>
        </div>

        {/* // platform stats */}
        <p className="mt-12 mb-4 text-xs font-semibold uppercase tracking-widest text-[#00FF00]">
          {"// platform stats"}
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="border border-[#666666]/20 p-4">
            <p className="text-xs text-[#666666] uppercase tracking-wider">
              Version
            </p>
            <p className="mt-1 text-lg font-mono font-semibold text-[#00A1D6]">
              v{data?.apiVersion ?? "---"}
            </p>
          </div>
          <div className="border border-[#666666]/20 p-4">
            <p className="text-xs text-[#666666] uppercase tracking-wider">
              Endeavors
            </p>
            <p className="mt-1 text-lg font-mono font-semibold text-[#00A1D6]">
              {data?.stats.totalEndeavors ?? "---"}
            </p>
          </div>
          <div className="border border-[#666666]/20 p-4">
            <p className="text-xs text-[#666666] uppercase tracking-wider">
              Users
            </p>
            <p className="mt-1 text-lg font-mono font-semibold text-[#00A1D6]">
              {data?.stats.totalUsers ?? "---"}
            </p>
          </div>
        </div>

        {/* // system info */}
        <p className="mt-12 mb-4 text-xs font-semibold uppercase tracking-widest text-[#00FF00]">
          {"// system info"}
        </p>
        <div className="border border-[#666666]/20 p-4 font-mono text-xs text-[#666666] space-y-1">
          <p>
            status:{" "}
            <span className={data?.status === "ok" ? "text-[#00FF00]" : "text-red-400"}>
              {data?.status ?? "checking"}
            </span>
          </p>
          <p>
            api_version:{" "}
            <span className="text-[#00A1D6]">{data?.apiVersion ?? "---"}</span>
          </p>
          <p>
            uptime:{" "}
            <span className="text-white">
              {data ? formatUptime(data.uptime) : "---"}
            </span>
          </p>
          <p>
            last_checked:{" "}
            <span className="text-white">
              {data?.lastChecked ?? "---"}
            </span>
          </p>
          <p>
            refresh_interval:{" "}
            <span className="text-white">30s</span>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
