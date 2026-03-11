import type { Metadata } from "next";
import { Fira_Code } from "next/font/google";
import { ToastProvider } from "@/components/toast";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts";
import { ScrollToTop } from "@/components/scroll-to-top";
import { WhatsNewBanner } from "@/components/whats-new-banner";
import "./globals.css";

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Endeavor — Post. Join. Plan. Fund. Make it happen.",
  description:
    "Post what you want to do. Find people who want to do it with you. Plan it, fund it, make it happen.",
  openGraph: {
    title: "Endeavor",
    description:
      "Post what you want to do. Find people who want to do it with you. Plan it, fund it, make it happen.",
    type: "website",
  },
  alternates: {
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${firaCode.variable} font-mono antialiased`}>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <ToastProvider>
          <KeyboardShortcuts />
          <ScrollToTop />
          <WhatsNewBanner />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
