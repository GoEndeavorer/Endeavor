import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stories | Endeavor",
  description:
    "Read stories from the Endeavor community about their journeys, achievements, and experiences.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
