import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Knowledge Base | Endeavor",
  description:
    "Browse articles and guides from the Endeavor community. Find answers, share knowledge, and learn from others.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
