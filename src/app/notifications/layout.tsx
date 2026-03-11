import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notifications | Endeavor",
  description: "View your notifications",
};

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
