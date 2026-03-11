import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare Endeavors | Endeavor",
  description: "Compare endeavors side by side",
};

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
