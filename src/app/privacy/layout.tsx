import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Endeavor",
  description:
    "Read Endeavor's privacy policy to understand how we collect, use, and protect your personal information.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
