import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Help – Endeavor",
  description:
    "Find answers to frequently asked questions about Endeavor — getting started, collaboration, communication, funding, and account settings.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
