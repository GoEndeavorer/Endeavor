import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat Rooms | Endeavor",
  description:
    "Join chat rooms to discuss endeavors, share ideas, and collaborate in real time.",
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return children;
}
