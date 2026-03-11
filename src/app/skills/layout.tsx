import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skills | Endeavor",
  description: "Explore skills across the platform",
};

export default function SkillsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
