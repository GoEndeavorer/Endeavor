import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog — Endeavor",
  description: "See what's new on Endeavor. Browse the latest features, improvements, and bug fixes.",
};

export default function ChangelogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
