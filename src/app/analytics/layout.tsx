import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics Overview — Endeavor",
  description: "Platform-wide analytics including activity trends, growth metrics, and category breakdowns.",
};

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
