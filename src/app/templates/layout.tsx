import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Templates | Endeavor",
  description: "Browse pre-built templates for common endeavor types. Start your next project faster with a hackathon, book club, sports league, and more.",
};

export default function TemplatesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
