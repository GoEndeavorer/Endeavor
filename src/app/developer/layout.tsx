import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developer Settings | Endeavor",
  description: "Manage API keys, webhooks, and integrations",
};

export default function DeveloperLayout({ children }: { children: React.ReactNode }) {
  return children;
}
