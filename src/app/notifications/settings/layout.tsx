import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notification Settings | Endeavor",
  description: "Configure which notifications you receive",
};

export default function NotificationSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
