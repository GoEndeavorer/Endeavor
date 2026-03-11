import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Polls | Endeavor",
  description: "Create and vote on community polls",
};

export default function PollsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
