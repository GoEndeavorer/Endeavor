import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Levels & Ranks | Endeavor",
  description:
    "View all XP levels, rank titles, and how to earn experience points on Endeavor.",
};

export default function LevelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
