import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Endeavors — Endeavor",
  description: "Compare endeavors side by side to evaluate progress, teams, and funding across projects.",
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
