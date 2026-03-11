import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Creator Reports — Endeavor",
  description: "Analytics and insights for your endeavors.",
};

export default function ReportsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
