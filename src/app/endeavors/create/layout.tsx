import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create an Endeavor | Endeavor",
  description: "Post what you want to do. Set the details, invite others, and make it happen.",
};

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
