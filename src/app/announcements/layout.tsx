import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Announcements | Endeavor",
  description: "Platform announcements and updates for the Endeavor community.",
};

export default function AnnouncementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
