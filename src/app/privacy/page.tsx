import type { Metadata } from "next";
import Link from "next/link";

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
          Last updated: September 25, 2026
        </p>

        <section className="space-y-6 leading-relaxed">
          <div>
            <h2 className="mb-2 text-xl font-semibold text-white">
              1. Information We Collect
            </h2>
            <p>
              <strong>Account Information.</strong> When you sign in using your
              email address (magic link or one-time code), we store your email
              address to create and manage your account.
            </p>
            <p className="mt-2">
              <strong>Your library and viewing progress.</strong> We store the
              series you save to My List and how far you are in each episode,
              linked to your account, so your list and resume point follow you
              across devices. On this device, guests&apos; list and progress are
              kept locally until they sign in.
            </p>
            <p className="mt-2">
              <strong>Subscription status.</strong> We store whether your
              account has an active subscription and which plan it is on.
            </p>
            <p className="mt-2">
              <strong>What we do not collect.</strong> We do not run analytics
              or crash-reporting SDKs, we do not send push notifications, and we
              do not collect your location, contacts, device identifiers,
              advertising IDs, search history, or payment card details. Searches
              you type are filtered on your device and are never transmitted to
              us.
            </p>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold text-white">
              2. How We Use Your Information
            </h2>
            <ul className="list-inside list-disc space-y-1">
              <li>To provide and maintain the IAmoviestory service</li>
              <li>To sign you in and manage your account</li>
              <li>To sync your My List and viewing progress across devices</li>
              <li>To show and manage your subscription status</li>
              <li>To respond to your requests, including deletion requests</li>
            </ul>
          </div>

          <div>
            <h2 className="mb-2 text-xl font-semibold text-white">
              3. Data Sharing
            </h2>
            <p>
              We do not sell your personal information, and we do not share it
              with advertisers. We use service providers that process data only
              on our behalf:
            </p>
            <ul className="list-inside list-disc space-y-1 mt-2">
              <li>
                <strong>Supabase</strong> — sign-in (email) and database
                storage
              </li>
              <li>
                <strong>Vercel</strong> — hosting and transport
              </li>
              <li>
                <strong>Bunny CDN</strong> — video delivery (streams media; no
                account data)
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
              We may update this policy from time to time. The latest version
              is always published on this page, with the date it was last
              updated at the top.
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
            <p className="mt-3 text-sm text-gray-500">
              See also our{" "}
              <Link
                href="/"
                className="text-[#D4AF37] underline hover:text-[#e6c35a]"
              >
                home page
              </Link>
              .
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
