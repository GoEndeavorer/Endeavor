import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Who's Hiring | Endeavor",
  description:
    "Find endeavors actively looking for people with your skills. Browse open positions and join projects that need what you have to offer.",
};

export default function HiringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
