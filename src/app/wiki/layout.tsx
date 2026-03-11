import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wiki | Endeavor",
  description: "Community knowledge base and documentation for Endeavor.",
};

export default function WikiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
