import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Messages – Endeavor",
  description: "Direct messages with other Endeavor users.",
};

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
