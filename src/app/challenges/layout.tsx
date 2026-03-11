import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Challenges | Endeavor",
  description: "Take on challenges, compete with others, and earn rewards",
};

export default function ChallengesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
