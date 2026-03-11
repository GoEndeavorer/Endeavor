import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integrations | Endeavor",
  description: "Connect third-party services to enhance your workflow",
};

export default function IntegrationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
