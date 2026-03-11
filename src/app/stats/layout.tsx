import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platform Stats — Endeavor",
  description: "View live platform metrics including active endeavors, community growth, and funding milestones.",
};

export default function StatsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
