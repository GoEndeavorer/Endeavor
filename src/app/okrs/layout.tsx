import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OKRs | Endeavor",
  description: "Track objectives and key results for your endeavors",
};

export default function OKRsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
