import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | Endeavor",
  description:
    "Review Endeavor's terms of service governing your use of the platform.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
