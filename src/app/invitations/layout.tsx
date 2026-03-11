import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Invitations | Endeavor",
  description: "View and manage your invitations",
};

export default function InvitationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
