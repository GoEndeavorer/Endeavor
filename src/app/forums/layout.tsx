import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forums | Endeavor",
  description:
    "Join discussions, ask questions, and connect with the Endeavor community.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
