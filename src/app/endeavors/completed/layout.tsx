import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Completed Endeavors | Endeavor",
  description:
    "Browse completed endeavors and see what the community has accomplished together.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
