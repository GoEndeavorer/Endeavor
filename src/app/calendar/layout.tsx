import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calendar | Endeavor",
  description: "View your upcoming tasks and milestones across all your endeavors.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
