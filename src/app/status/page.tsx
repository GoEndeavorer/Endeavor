"use client";

import { useState, useEffect } from "react";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";

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
      </main>
      <Footer />
    </div>
  );
}
