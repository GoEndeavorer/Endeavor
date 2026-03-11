import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Snippets | Endeavor",
  description:
    "Share, discover, and save code snippets with the Endeavor community.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
