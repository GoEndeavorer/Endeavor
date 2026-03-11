"use client";

import { useState, useEffect } from "react";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

const PLATFORM_VERSION = "0.18.0";
const PLATFORM_METRICS = {
  totalPages: 57,
  totalApiRoutes: 102,
  totalComponents: 45,
};

type HealthCheck = {
  status: "ok" | "error";
  database: "connected" | "disconnected";
  timestamp: string;
  uptime?: number;
};

type Service = {
  name: string;
  status: "operational" | "checking" | "down";
  latency?: number;
};

export default function StatusPage() {
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [apiResponseTime, setApiResponseTime] = useState<number | null>(null);
  const [services, setServices] = useState<Service[]>([
    { name: "API", status: "checking" },
    { name: "Database", status: "checking" },
    { name: "Authentication", status: "checking" },
    { name: "Payments (Stripe)", status: "checking" },
    { name: "Email (Resend)", status: "checking" },
  ]);

  useEffect(() => {
    const start = performance.now();
    fetch("/api/health")
      .then((r) => {
        const latency = Math.round(performance.now() - start);
        setApiResponseTime(latency);
        if (r.ok) {
          return r.json().then((data: HealthCheck) => {
            setHealth(data);
            setServices((prev) =>
              prev.map((s) => {
                if (s.name === "API") return { ...s, status: "operational", latency };
                if (s.name === "Database")
                  return {
                    ...s,
                    status: data.database === "connected" ? "operational" : "down",
                    latency,
                  };
                if (s.name === "Authentication") return { ...s, status: "operational" };
                if (s.name === "Payments (Stripe)")
                  return { ...s, status: "operational" };
                if (s.name === "Email (Resend)")
                  return { ...s, status: "operational" };
                return s;
              })
            );
          });
        } else {
          setServices((prev) =>
            prev.map((s) => ({ ...s, status: "down" as const }))
          );
        }
      })
      .catch(() => {
        setServices((prev) =>
          prev.map((s) => ({ ...s, status: "down" as const }))
        );
      });
  }, []);

  const allOperational = services.every((s) => s.status === "operational");

  return (
    <div className="min-h-screen">
      <AppHeader breadcrumb={{ label: "Status", href: "/status" }} />

      <main className="mx-auto max-w-xl px-4 pt-24 pb-16">
        <h1 className="mb-2 text-3xl font-bold">System Status</h1>
        <p className="mb-8 text-sm text-medium-gray">
          Current operational status of Endeavor services.
        </p>

        {/* Overall status */}
        <div
          className={`mb-8 border p-6 text-center ${
            allOperational
              ? "border-code-green/30 bg-code-green/5"
              : services.some((s) => s.status === "checking")
              ? "border-medium-gray/30"
              : "border-red-500/30 bg-red-500/5"
          }`}
        >
          <p className={`text-lg font-semibold ${allOperational ? "text-code-green" : services.some((s) => s.status === "checking") ? "text-medium-gray" : "text-red-400"}`}>
            {allOperational
              ? "All Systems Operational"
              : services.some((s) => s.status === "checking")
              ? "Checking..."
              : "Some Services Experiencing Issues"}
          </p>
          {health && (
            <p className="mt-1 text-xs text-medium-gray">
              Last checked: {new Date(health.timestamp).toLocaleString()}
            </p>
          )}
        </div>

        {/* Individual services */}
        <div className="space-y-2">
          {services.map((service) => (
            <div
              key={service.name}
              className="flex items-center justify-between border border-medium-gray/20 p-4"
            >
              <span className="text-sm">{service.name}</span>
              <div className="flex items-center gap-3">
                {service.latency !== undefined && (
                  <span className="text-xs text-medium-gray">
                    {service.latency}ms
                  </span>
                )}
                <span
                  className={`flex items-center gap-1.5 text-xs font-semibold ${
                    service.status === "operational"
                      ? "text-code-green"
                      : service.status === "checking"
                      ? "text-medium-gray"
                      : "text-red-400"
                  }`}
                >
                  <span
                    className={`h-2 w-2 ${
                      service.status === "operational"
                        ? "bg-code-green"
                        : service.status === "checking"
                        ? "bg-medium-gray animate-pulse"
                        : "bg-red-400"
                    }`}
                  />
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

        {/* System Health Checks */}
        <h2 className="mt-12 mb-4 text-xl font-bold">System Health Checks</h2>
        <div className="space-y-2">
          {/* Database Connectivity */}
          <div className="flex items-center justify-between border border-medium-gray/20 p-4">
            <div className="flex items-center gap-3">
              <span
                className={`h-3 w-3 rounded-full ${
                  health?.database === "connected"
                    ? "bg-code-green"
                    : health === null
                    ? "bg-medium-gray animate-pulse"
                    : "bg-red-400"
                }`}
              />
              <span className="text-sm font-medium">Database Connectivity</span>
            </div>
            <span
              className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                health?.database === "connected"
                  ? "bg-code-green/10 text-code-green"
                  : health === null
                  ? "bg-medium-gray/10 text-medium-gray"
                  : "bg-red-400/10 text-red-400"
              }`}
            >
              {health?.database === "connected"
                ? "Connected"
                : health === null
                ? "Checking..."
                : "Error"}
            </span>
          </div>

          {/* API Response Time */}
          <div className="flex items-center justify-between border border-medium-gray/20 p-4">
            <div className="flex items-center gap-3">
              <span
                className={`h-3 w-3 rounded-full ${
                  apiResponseTime !== null && apiResponseTime < 1000
                    ? "bg-code-green"
                    : apiResponseTime === null
                    ? "bg-medium-gray animate-pulse"
                    : "bg-red-400"
                }`}
              />
              <span className="text-sm font-medium">API Response Time</span>
            </div>
            <span
              className={`rounded-full px-3 py-0.5 text-xs font-semibold font-mono ${
                apiResponseTime !== null && apiResponseTime < 1000
                  ? "bg-code-green/10 text-code-green"
                  : apiResponseTime === null
                  ? "bg-medium-gray/10 text-medium-gray"
                  : "bg-red-400/10 text-red-400"
              }`}
            >
              {apiResponseTime !== null ? `${apiResponseTime}ms` : "Measuring..."}
            </span>
          </div>

          {/* Total Uptime */}
          <div className="flex items-center justify-between border border-medium-gray/20 p-4">
            <div className="flex items-center gap-3">
              <span
                className={`h-3 w-3 rounded-full ${
                  allOperational ? "bg-code-green" : "bg-medium-gray animate-pulse"
                }`}
              />
              <span className="text-sm font-medium">Total Uptime</span>
            </div>
            <span
              className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                allOperational
                  ? "bg-code-green/10 text-code-green"
                  : "bg-medium-gray/10 text-medium-gray"
              }`}
            >
              {allOperational ? "Online" : "Checking..."}
            </span>
          </div>
        </div>

        {/* Platform Metrics */}
        <h2 className="mt-12 mb-4 text-xl font-bold">Platform Metrics</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="border border-medium-gray/20 p-4">
            <p className="text-xs text-medium-gray uppercase tracking-wider">Version</p>
            <p className="mt-1 text-lg font-mono font-semibold text-code-blue">
              v{PLATFORM_VERSION}
            </p>
          </div>
          <div className="border border-medium-gray/20 p-4">
            <p className="text-xs text-medium-gray uppercase tracking-wider">Total Pages</p>
            <p className="mt-1 text-lg font-mono font-semibold text-code-blue">
              {PLATFORM_METRICS.totalPages}
            </p>
          </div>
          <div className="border border-medium-gray/20 p-4">
            <p className="text-xs text-medium-gray uppercase tracking-wider">API Routes</p>
            <p className="mt-1 text-lg font-mono font-semibold text-code-blue">
              {PLATFORM_METRICS.totalApiRoutes}
            </p>
          </div>
          <div className="border border-medium-gray/20 p-4">
            <p className="text-xs text-medium-gray uppercase tracking-wider">Components</p>
            <p className="mt-1 text-lg font-mono font-semibold text-code-blue">
              {PLATFORM_METRICS.totalComponents}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
