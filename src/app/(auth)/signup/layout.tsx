import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Endeavor",
  description: "Create an Endeavor account. Post what you want to do, find people to do it with.",
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
