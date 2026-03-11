import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Badges | Endeavor",
  description:
    "Browse all badges you can earn on Endeavor. Complete challenges, contribute to projects, and unlock rare collectibles.",
};

export default function BadgesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
