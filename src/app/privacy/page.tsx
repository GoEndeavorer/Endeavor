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
      <AppHeader breadcrumb={{ label: "Privacy Policy", href: "/privacy" }} />

      <main className="mx-auto max-w-3xl px-4 pt-24 pb-16">
        <h1 className="mb-2 text-3xl font-bold md:text-4xl">Privacy Policy</h1>
        <p className="mb-12 text-sm text-medium-gray">
          Effective date: March 11, 2026 &middot; Last updated: March 11, 2026
        </p>

        <p className="mb-12 text-sm leading-relaxed text-light-gray">
          At Endeavor, we take the privacy of our users seriously. This Privacy Policy
          explains what information we collect, how we use it, who we share it with, and
          what rights you have regarding your data. By using the Endeavor platform, you
          agree to the collection and use of information in accordance with this policy.
        </p>

        {/* Information We Collect */}
        <section className="mb-12">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// information we collect"}
          </h2>
          <div className="space-y-6 text-sm leading-relaxed text-light-gray">
            <div>
              <h3 className="mb-2 font-semibold text-white">Account Information</h3>
              <p>
                When you create an Endeavor account, we collect your name, email address,
                and password. Passwords are never stored in plain text; they are hashed using
                the scrypt key derivation function before storage. You may optionally provide
                additional profile information such as a bio, location, profile photo, skills,
                and interests.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-white">Usage Information</h3>
              <p>
                We automatically collect information about how you interact with the platform,
                including pages visited, endeavors viewed, search queries, timestamps of
                activity, browser type, device information, IP address, and referring URLs.
                This data helps us understand usage patterns and improve the platform experience.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-white">Content You Provide</h3>
              <p>
                When you create or participate in endeavors, we collect the content you post,
                including endeavor descriptions, comments, discussions, messages, files,
                images, milestones, tasks, and any other materials you upload or share through
                the platform. This also includes endorsements, reviews, and stories you write
                about completed endeavors.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-white">Payment Information</h3>
              <p>
                If you participate in endeavors with a cost-to-join fee or contribute to
                crowdfunded endeavors, payment processing is handled entirely by Stripe. We
                do not store your credit card number, bank account details, or other sensitive
                financial information on our servers. We may retain transaction identifiers,
                amounts, and dates for record-keeping purposes.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-white">Communications</h3>
              <p>
                If you contact us directly (for example, through our help center or contact
                page), we may retain the content of those communications along with your
                email address and any other information you provide, in order to respond to
                your inquiry and maintain a record of correspondence.
              </p>
            </div>
          </div>
        </section>

        {/* How We Use Your Information */}
        <section className="mb-12">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// how we use your information"}
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-light-gray">
            <p>We use the information we collect to:</p>
            <ul className="ml-4 list-disc space-y-2">
              <li>Provide, operate, and maintain the Endeavor platform</li>
              <li>Create and manage your account, including authentication and authorization</li>
              <li>Match you with relevant endeavors based on your skills, interests, and location</li>
              <li>Facilitate communication between endeavor creators and participants</li>
              <li>Process payments for cost-to-join fees and crowdfunding contributions</li>
              <li>Send transactional emails including welcome messages, payment confirmations, invitation notifications, and endeavor updates</li>
              <li>Send periodic digests and notifications about endeavors you follow or participate in (you can control these in your notification settings)</li>
              <li>Generate aggregated, anonymized analytics to improve the platform (such as trending categories, popular skills, and platform activity metrics)</li>
              <li>Populate leaderboards, achievement systems, and endorsement features</li>
              <li>Detect, investigate, and prevent fraudulent, unauthorized, or illegal activity</li>
              <li>Enforce our Terms of Service and other policies</li>
              <li>Respond to support requests and provide customer service</li>
            </ul>
          </div>
        </section>

        {/* Data Sharing and Third Parties */}
        <section className="mb-12">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// data sharing and third parties"}
          </h2>
          <div className="space-y-6 text-sm leading-relaxed text-light-gray">
            <p>
              <strong className="text-white">We do not sell your personal data.</strong> We
              do not rent, trade, or otherwise monetize your personal information. We share
              your data only in the following limited circumstances:
            </p>
            <div>
              <h3 className="mb-2 font-semibold text-white">Service Providers</h3>
              <p className="mb-3">
                We work with trusted third-party service providers who process data on our
                behalf in order to operate the platform. These providers are contractually
                obligated to use your data only for the purposes we specify:
              </p>
              <ul className="ml-4 list-disc space-y-2">
                <li>
                  <strong className="text-white">Stripe</strong> — Payment processing for
                  cost-to-join fees and crowdfunding contributions. Stripe&apos;s handling of your
                  payment information is governed by their own{" "}
                  <a
                    href="https://stripe.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-code-blue hover:text-code-green"
                  >
                    Privacy Policy
                  </a>
                  .
                </li>
                <li>
                  <strong className="text-white">Resend</strong> — Transactional and
                  notification email delivery. Resend processes your email address and name
                  to deliver messages on our behalf.
                </li>
                <li>
                  <strong className="text-white">Vercel</strong> — Application hosting,
                  deployment, and edge network infrastructure. Vercel may process request
                  metadata (IP addresses, user agents) as part of serving the application.
                </li>
                <li>
                  <strong className="text-white">Neon</strong> — Serverless PostgreSQL
                  database hosting. All user data stored in our database is hosted on
                  Neon&apos;s infrastructure with encryption at rest and in transit.
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-white">Other Users</h3>
              <p>
                Certain information you provide is visible to other Endeavor users by design.
                Your public profile (name, bio, skills, location, and profile photo) is
                visible to anyone on the platform. Content you post within endeavors
                (comments, discussions, files) is visible to other participants of that
                endeavor. Endeavors you create or join may be publicly listed depending on
                their visibility settings.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-white">Legal Requirements</h3>
              <p>
                We may disclose your information if required to do so by law, or if we
                believe in good faith that such disclosure is necessary to comply with a
                legal obligation, protect and defend our rights or property, prevent fraud,
                or protect the personal safety of users or the public.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-white">Business Transfers</h3>
              <p>
                In the event of a merger, acquisition, reorganization, or sale of assets,
                your information may be transferred as part of that transaction. We will
                notify you via email or a prominent notice on the platform before your
                information becomes subject to a different privacy policy.
              </p>
            </div>
          </div>
        </section>

        {/* Data Security */}
        <section className="mb-12">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// data security"}
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-light-gray">
            <p>
              We implement industry-standard security measures to protect your personal
              information from unauthorized access, alteration, disclosure, or destruction:
            </p>
            <ul className="ml-4 list-disc space-y-2">
              <li>
                <strong className="text-white">Encryption in transit:</strong> All
                connections to the Endeavor platform are encrypted using TLS/HTTPS.
              </li>
              <li>
                <strong className="text-white">Encryption at rest:</strong> Data stored in
                our database is encrypted at rest using AES-256 encryption.
              </li>
              <li>
                <strong className="text-white">Password hashing:</strong> User passwords are
                hashed using the scrypt key derivation function, making them computationally
                infeasible to reverse.
              </li>
              <li>
                <strong className="text-white">PCI compliance:</strong> All payment
                processing is handled by Stripe&apos;s PCI-DSS compliant infrastructure.
                Sensitive financial data never touches our servers.
              </li>
              <li>
                <strong className="text-white">Access controls:</strong> Access to user data
                is restricted to authorized personnel on a need-to-know basis. We maintain
                audit logs for administrative access.
              </li>
            </ul>
            <p>
              While we strive to protect your personal information, no method of
              transmission or storage is 100% secure. We cannot guarantee absolute security,
              but we are committed to promptly notifying affected users in the event of a
              data breach.
            </p>
          </div>
        </section>

        {/* Your Rights */}
        <section className="mb-12">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// your rights"}
          </h2>
          <div className="space-y-6 text-sm leading-relaxed text-light-gray">
            <p>
              You have the following rights regarding your personal data. You can exercise
              most of these directly from your{" "}
              <Link href="/settings" className="text-code-blue hover:text-code-green">
                Settings
              </Link>{" "}
              page:
            </p>
            <div>
              <h3 className="mb-2 font-semibold text-white">Right to Access</h3>
              <p>
                You have the right to request a copy of the personal data we hold about
                you. You can view and download your profile information, endeavor history,
                and activity data at any time through your account settings.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-white">Right to Correction</h3>
              <p>
                You have the right to update or correct inaccurate personal data. You can
                edit your profile, bio, skills, location, and other account information
                directly from your profile or settings page at any time.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-white">Right to Deletion</h3>
              <p>
                You have the right to request deletion of your account and associated
                personal data. Account deletion can be initiated from your settings page and
                will permanently remove your profile, personal information, and associated
                content. Some information may be retained where required by law or for
                legitimate business purposes (such as payment records for tax compliance).
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-white">Right to Data Portability</h3>
              <p>
                You have the right to receive your personal data in a structured,
                commonly-used, machine-readable format. You can export your data including
                your profile, endeavors you created, and your activity history from the
                settings page.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-white">Right to Restrict Processing</h3>
              <p>
                You have the right to request that we restrict the processing of your
                personal data in certain circumstances, such as when you contest the accuracy
                of the data or object to our processing of it. Contact us to exercise this
                right.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-white">Right to Object</h3>
              <p>
                You have the right to object to our processing of your personal data for
                direct marketing purposes. You can opt out of non-essential communications
                at any time through your notification settings or by using the unsubscribe
                link in our emails.
              </p>
            </div>
          </div>
        </section>

        {/* Cookies and Local Storage */}
        <section className="mb-12">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// cookies and local storage"}
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-light-gray">
            <div>
              <h3 className="mb-2 font-semibold text-white">Essential Cookies</h3>
              <p>
                We use session cookies that are strictly necessary for the operation of the
                platform. These cookies manage your authentication state and ensure you
                remain logged in as you navigate between pages. These cookies are not
                optional and cannot be disabled while using the platform.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-white">Local Storage</h3>
              <p>
                We use browser localStorage to persist your preferences, such as notification
                settings, recently viewed endeavors, theme preferences, and UI state. This
                data is stored locally on your device and is never transmitted to our servers.
                You can clear this data at any time through your browser settings.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-white">What We Do Not Use</h3>
              <p>
                We do not use third-party tracking cookies, advertising cookies, or analytics
                cookies that track your behavior across other websites. We do not participate
                in cross-site tracking or ad networks. We do not use pixel trackers or
                fingerprinting techniques.
              </p>
            </div>
          </div>
        </section>

        {/* Data Retention */}
        <section className="mb-12">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// data retention"}
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-light-gray">
            <p>
              We retain your personal data for as long as your account is active or as
              needed to provide you with our services. If you delete your account, we will
              delete or anonymize your personal data within 30 days, except where we are
              required to retain certain information for legal or regulatory compliance
              (such as financial transaction records, which may be retained for up to 7
              years for tax purposes).
            </p>
            <p>
              Anonymized and aggregated data that cannot be used to identify you may be
              retained indefinitely for analytics and platform improvement purposes.
            </p>
          </div>
        </section>

        {/* Children's Privacy */}
        <section className="mb-12">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// children's privacy"}
          </h2>
          <div className="text-sm leading-relaxed text-light-gray">
            <p>
              Endeavor is not intended for use by children under the age of 13. We do not
              knowingly collect personal information from children under 13. If you are a
              parent or guardian and believe that your child has provided us with personal
              information, please contact us immediately. If we discover that we have
              collected personal information from a child under 13 without verification of
              parental consent, we will take steps to delete that information promptly.
            </p>
          </div>
        </section>

        {/* International Data Transfers */}
        <section className="mb-12">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// international data transfers"}
          </h2>
          <div className="text-sm leading-relaxed text-light-gray">
            <p>
              Your information may be transferred to and processed in countries other than
              your own. Our service providers operate infrastructure in various regions. By
              using Endeavor, you consent to the transfer of your data to these locations.
              We ensure appropriate safeguards are in place for international data transfers,
              including standard contractual clauses where applicable.
            </p>
          </div>
        </section>

        {/* Changes to This Policy */}
        <section className="mb-12">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// changes to this policy"}
          </h2>
          <div className="text-sm leading-relaxed text-light-gray">
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our
              practices, technology, legal requirements, or other factors. When we make
              material changes, we will notify you by posting a prominent notice on the
              platform and, where appropriate, sending you an email notification. Your
              continued use of Endeavor after any changes to this policy constitutes your
              acceptance of the updated terms. We encourage you to review this page
              periodically.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <h2 className="mb-6 text-xs font-semibold uppercase tracking-widest text-code-green">
            {"// contact"}
          </h2>
          <div className="space-y-4 text-sm leading-relaxed text-light-gray">
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy
              or our data practices, you can reach us through:
            </p>
            <ul className="ml-4 list-disc space-y-2">
              <li>
                The{" "}
                <Link href="/contact" className="text-code-blue hover:text-code-green">
                  Contact
                </Link>{" "}
                page on our platform
              </li>
              <li>
                The{" "}
                <Link href="/help" className="text-code-blue hover:text-code-green">
                  Help Center
                </Link>{" "}
                for general inquiries and support
              </li>
              <li>Email: privacy@endeavor.app</li>
            </ul>
            <p>
              We aim to respond to all privacy-related inquiries within 30 days.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
