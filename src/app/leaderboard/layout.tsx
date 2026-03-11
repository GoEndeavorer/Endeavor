import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard | Endeavor",
  description: "Top contributors on Endeavor",
};

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
