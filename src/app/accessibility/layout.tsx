import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessibility | Endeavor",
  description:
    "Learn about Endeavor's commitment to accessibility and how we work to make the platform usable for everyone.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
