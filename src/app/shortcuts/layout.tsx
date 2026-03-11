import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Keyboard Shortcuts | Endeavor",
  description: "Keyboard shortcuts for navigating Endeavor",
};

export default function ShortcutsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
