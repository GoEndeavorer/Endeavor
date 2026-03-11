import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guides — Endeavor",
  description: "Learn how to use the Endeavor platform with step-by-step guides and tutorials.",
};

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
