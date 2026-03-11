import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Export Data | Endeavor",
  description: "Export your data from Endeavor",
};

export default function ExportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
