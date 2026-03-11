import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About & FAQ | Endeavor",
  description:
    "Learn about Endeavor, our mission to connect people through shared goals, and find answers to frequently asked questions.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
