export const metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for Space Royale, an Android mobile game available on the Google Play Store.",
  alternates: {
    canonical: "/privacy",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const LAST_UPDATED = "July 1, 2026";
const CONTACT_EMAIL = "[YOUR_CONTACT_EMAIL@EXAMPLE.COM]";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
        {/* Header */}
        <header className="mb-10 border-b border-neutral-200 pb-8 dark:border-neutral-800">
          <p className="mb-2 text-xs font-semibold tracking-widest text-neutral-500 uppercase dark:text-neutral-400">
            Legal Document
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
            Application: <strong className="font-semibold">Space Royale</strong>
            <span className="mx-2">·</span>
            Last Updated: <strong className="font-semibold">{LAST_UPDATED}</strong>
          </p>
        </header>

        {/* Body */}
        <article className="space-y-10 text-[15px] leading-7 text-neutral-800 sm:text-base dark:text-neutral-300">
          <Section title="Introduction">
            <p>
              This Privacy Policy describes how Space Royale (&ldquo;the
              Application,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
              &ldquo;our&rdquo;) handles information in connection with your
              use of our Android mobile game, available on the Google Play
              Store. We are committed to protecting your privacy, and this
              policy explains our practices in plain terms.
            </p>
            <p>
              By downloading, installing, or playing Space Royale, you
              acknowledge that you have read and understood this Privacy
              Policy.
            </p>
          </Section>

          <Section title="Information Collection and Use">
            <p>
              <strong>
                Space Royale does not collect, store, transmit, or share any
                personally identifiable information.
              </strong>{" "}
              The Application does not require you to create an account, log
              in, or provide any personal details in order to play.
            </p>
            <p>Specifically, the Application does not collect:</p>
            <ul className="list-disc space-y-2 pl-6 marker:text-neutral-400">
              <li>Your name, email address, phone number, or other contact information</li>
              <li>Your precise or approximate location</li>
              <li>Your contacts, calendar entries, photos, or files</li>
              <li>Financial information or payment details</li>
              <li>Any user-generated content, since the Application contains no chat, messaging, or content-submission features</li>
              <li>
                Usage analytics, crash reports, or telemetry, beyond any
                basic platform services that Google Play or the Android
                operating system may require to distribute and operate the
                Application
              </li>
            </ul>
            <p>
              Game progress, settings, and preferences are stored locally on
              your device only. This data is never transmitted to us and is
              not accessible by us.
            </p>
          </Section>

          <Section title="Third-Party Services">
            <p>
              Space Royale does not integrate any third-party advertising
              networks, analytics platforms, social media SDKs, or other
              services that collect user data.
            </p>
            <p>
              The Application is distributed exclusively through the Google
              Play Store. Your download and installation of the Application
              are subject to Google Play&rsquo;s own terms of service and
              privacy policy, over which we have no control. We encourage you
              to review Google&rsquo;s Privacy Policy at{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 underline underline-offset-2 hover:text-indigo-500 dark:text-indigo-400"
              >
                https://policies.google.com/privacy
              </a>
              .
            </p>
            <p>
              Should the Application introduce advertising, analytics, or
              in-app purchases in the future, this Privacy Policy will be
              updated to disclose any relevant third-party services and the
              data practices associated with them prior to such features
              becoming active.
            </p>
          </Section>

          <Section title="Children's Privacy">
            <p>
              Space Royale is intended for a general audience and is
              designed to be suitable for players of all ages. The
              Application does not knowingly collect personal information
              from children under the age of 13, or the applicable age of
              digital consent in your jurisdiction.
            </p>
            <p>
              Because the Application does not collect personal information
              from any user, it presents no particular privacy risk to
              children: no account creation is required, no personal data is
              requested, and no data is transmitted from the device.
            </p>
            <p>
              If you are a parent or guardian and believe your child has
              provided personal information through the Application, please
              contact us using the information below, and we will take
              prompt steps to investigate and address the matter.
            </p>
          </Section>

          <Section title="Data Security">
            <p>
              Because Space Royale does not collect or transmit personal
              information, there is no personal data at risk of unauthorized
              access, disclosure, alteration, or destruction on any servers
              or systems operated by us.
            </p>
            <p>
              Game data stored locally on your device is protected by the
              security features of your Android device and operating system,
              such as screen locks, encryption, and application sandboxing.
              We recommend keeping your device and operating system up to
              date and enabling available security features to help protect
              all data stored on your device, including your local game
              data.
            </p>
          </Section>

          <Section title="Data Retention">
            <p>
              We do not retain any personal data, because none is collected.
              Local game data, such as saved progress and settings, remains
              on your device until you uninstall the Application or clear
              its data through your device&rsquo;s application settings.
              Uninstalling the Application removes all locally stored game
              data.
            </p>
          </Section>

          <Section title="Changes to This Privacy Policy">
            <p>
              We may update this Privacy Policy from time to time to reflect
              changes in the Application, applicable law, or our practices.
              When we do, we will revise the &ldquo;Last Updated&rdquo; date
              at the top of this page. If we make material changes, we will
              take reasonable steps to notify users, such as through an
              updated Application listing on the Google Play Store.
            </p>
            <p>
              Your continued use of the Application after any changes to
              this Privacy Policy constitutes your acceptance of the revised
              policy. We encourage you to review this page periodically to
              stay informed about how we handle privacy.
            </p>
          </Section>

          <Section title="Contact Information">
            <p>
              If you have any questions, concerns, or requests regarding
              this Privacy Policy or our privacy practices, please contact
              us at:
            </p>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-5 py-4 font-mono text-sm dark:border-neutral-800 dark:bg-neutral-900">
              <p className="mb-1 text-neutral-500 dark:text-neutral-400">Email:</p>
              <p className="text-indigo-600 dark:text-indigo-400">{CONTACT_EMAIL}</p>
            </div>
            <p>
              We will make reasonable efforts to respond to inquiries within
              30 days of receipt.
            </p>
          </Section>
        </article>

        {/* Footer */}
        <footer className="mt-16 border-t border-neutral-200 pt-6 text-center text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-500">
          <p>Space Royale &copy; 2026. All rights reserved.</p>
          <p className="mt-1">This Privacy Policy is effective as of {LAST_UPDATED}.</p>
        </footer>
      </div>
    </main>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="mb-3 border-b border-neutral-200 pb-2 text-lg font-bold text-indigo-700 sm:text-xl dark:border-neutral-800 dark:text-indigo-400">
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
