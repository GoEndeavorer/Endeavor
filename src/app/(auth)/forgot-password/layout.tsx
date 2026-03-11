import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | Endeavor",
  description:
    "Reset your Endeavor account password by entering your email address to receive a recovery link.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
