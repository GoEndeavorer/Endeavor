import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Achievements | Endeavor",
  description:
    "Track your progress and unlock achievements as you create, collaborate, and contribute on Endeavor.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
