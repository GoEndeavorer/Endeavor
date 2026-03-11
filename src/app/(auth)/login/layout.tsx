import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In | Endeavor",
  description: "Log in to your Endeavor account to create, join, and manage endeavors.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
