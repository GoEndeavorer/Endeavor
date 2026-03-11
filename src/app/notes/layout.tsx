import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notes | Endeavor",
  description: "Your personal notes and scratchpad",
};

export default function NotesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
