import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Documentation | Endeavor",
  description: "Explore the Endeavor platform API. Documentation for all public endpoints including endeavors, feed, users, activity, and more.",
};

export default function ApiDocsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
