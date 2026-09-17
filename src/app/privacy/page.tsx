import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — IAmoviestory",
  description:
    "How IAmoviestory collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-gray-300">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="mb-2 text-3xl font-bold text-white">Privacy Policy</h1>
        <p className="mb-8 text-sm text-gray-500">
          Last updated: September 17, 2026
        </p>

        <section className="space-y-6 leading-relaxed">
          <div>
            <h2 className="mb-2 text-xl font-semibold text-white">
              1. Information We Collect
            </h2>
            <p>
              <strong>Account Information.</strong> When you sign in using your
              email address (magic link or one-time code), we store your email
              to manage your account, watchlist, and viewing history.
            </p>
            <p className="mt-2">
              <strong>Usage Data.</strong> We collect information about how you
              use the app — series you watch, episodes you complete, time spent
              viewing, and interaction with features like watchlist and rewards.
            </p>
            <p className="mt-2">
              <strong>Device Information.</strong> We may collect device type,
              operating system version, app version, and a device token for push
              notifications.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold text-white">
              2. How We Use Your Information
            </h2>
            <ul className="list-inside list-disc space-y-1">
              <li>To provide and maintain the IAmoviestory service</li>
              <li>To manage your account and subscription</li>
              <li>To personalize your experience and recommend content</li>
              <li>To send push notifications about new series and updates</li>
              <li>To process reward points and track viewing progress</li>
              <li>To improve our service and fix technical issues</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold text-white">
              3. Data Sharing
            </h2>
            <p>
              We do not sell your personal information. We may share data with:
            </p>
            <ul className="list-inside list-disc space-y-1 mt-2">
              <li>
                <strong>Payment processors</strong> (PayPal) to handle
                transactions
              </li>
              <li>
                <strong>Analytics services</strong> to understand usage patterns
              </li>
              <li>
                <strong>Push notification services</strong> to deliver alerts
              </li>
            </ul>
            <p className="mt-2">
              We may disclose information if required by law or to protect our
              rights and safety.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold text-white">
              4. Data Security
            </h2>
            <p>
              We use industry-standard security measures including encrypted
              connections (HTTPS), secure authentication tokens, and
              server-side access controls. However, no method of transmission
              over the internet is 100% secure.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold text-white">
              5. Your Rights
            </h2>
            <ul className="list-inside list-disc space-y-1">
              <li>Access and download your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and data</li>
              <li>Opt out of push notifications at any time</li>
            </ul>
            <p className="mt-2">
              To exercise these rights, contact us at the email below.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold text-white">
              6. Children&apos;s Privacy
            </h2>
            <p>
              IAmoviestory is not intended for children under 13. We do not
              knowingly collect personal information from children under 13.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold text-white">
              7. Changes to This Policy
            </h2>
            <p>
              We may update this policy from time to time. We will notify you
              of significant changes through the app or by email.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold text-white">
              8. Contact Us
            </h2>
            <p>
              If you have questions about this privacy policy, contact us at:{" "}
              <a
                href="mailto:privacy@iamoviestory.com"
                className="text-red-400 underline hover:text-red-300"
              >
                privacy@iamoviestory.com
              </a>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
