import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Endorsements — Endeavor",
  description:
    "See what people are saying about each other on Endeavor.",
};

export default function EndorsementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
