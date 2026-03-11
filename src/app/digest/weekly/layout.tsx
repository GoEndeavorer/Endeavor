import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weekly Digest | Endeavor",
  description: "Your personal weekly recap of activity across your endeavors.",
};

export default function WeeklyDigestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
