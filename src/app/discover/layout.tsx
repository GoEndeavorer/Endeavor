import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Discover | Endeavor",
  description:
    "Discover new endeavors, explore trending projects, and find communities to join on Endeavor.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
