import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { Footer } from "@/components/footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Endeavor",
  description: "Endeavor's privacy policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <AppHeader />
      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <h1 className="mb-2 text-2xl font-bold">Privacy Policy</h1>
        <p className="mb-8 text-sm text-medium-gray">Last updated: March 2026</p>

        <div className="space-y-6 text-sm leading-relaxed text-light-gray">
          <section>
            <h2 className="mb-2 text-lg font-bold text-white">What We Collect</h2>
            <p>
              When you create an account, we collect your name, email address, and password (stored securely using scrypt hashing). You may optionally provide a bio, location, skills, and interests to enhance your experience.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-white">How We Use Your Data</h2>
            <ul className="ml-4 list-disc space-y-1">
              <li>To provide and maintain the Endeavor platform</li>
              <li>To match you with relevant endeavors based on your skills and interests</li>
              <li>To send you notifications about endeavors you&apos;ve joined</li>
              <li>To process payments through Stripe (we never store your payment details)</li>
              <li>To send transactional emails (welcome, payment confirmation, invites)</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-white">Data Sharing</h2>
            <p>
              We do not sell your personal data. Your profile information (name, bio, skills) is visible to other Endeavor users. We share data with:
            </p>
            <ul className="ml-4 list-disc space-y-1">
              <li><strong>Stripe</strong> — for payment processing</li>
              <li><strong>Resend</strong> — for transactional emails</li>
              <li><strong>Vercel</strong> — for hosting and analytics</li>
              <li><strong>Neon</strong> — for database hosting</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-white">Your Rights</h2>
            <p>
              You can update or delete your profile at any time from{" "}
              <Link href="/settings" className="text-code-blue hover:text-code-green">Settings</Link>.
              Account deletion removes your account and associated data permanently.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-white">Cookies</h2>
            <p>
              We use session cookies for authentication. We use localStorage for preferences (notification settings, recently viewed items). We do not use tracking cookies.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-white">Security</h2>
            <p>
              Passwords are hashed using scrypt. All connections are encrypted via HTTPS. Payment processing is handled entirely by Stripe&apos;s PCI-compliant infrastructure.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-bold text-white">Contact</h2>
            <p>
              Questions about this policy? Reach out via the platform or email us at the address in our footer.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
