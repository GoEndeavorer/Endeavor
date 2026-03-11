import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Automations | Endeavor",
  description: "Set up automated workflows for your projects",
};

export default function AutomationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
