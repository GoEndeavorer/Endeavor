import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weekly Digest – Endeavor",
  description: "Your personalized weekly summary of activity across your endeavors.",
};

export default function DigestLayout({ children }: { children: React.ReactNode }) {
  return children;
}
