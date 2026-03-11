import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | Endeavor",
  description:
    "Create a new password for your Endeavor account to regain access.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
