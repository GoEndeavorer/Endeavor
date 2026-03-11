import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboard | Endeavor",
  description:
    "See the top creators, contributors, and most active members of the Endeavor community.",
};

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
