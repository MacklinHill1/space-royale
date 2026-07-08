export const metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for Space Royale, an Android mobile game available on the Google Play Store.",
  alternates: {
    canonical: "/tos",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const LAST_UPDATED = "July 8, 2026";
const CONTACT_EMAIL = "[YOUR_CONTACT_EMAIL@EXAMPLE.COM]";

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
        {/* Header */}
        <header className="mb-10 border-b border-neutral-200 pb-8 dark:border-neutral-800">
          <p className="mb-2 text-xs font-semibold tracking-widest text-neutral-500 uppercase dark:text-neutral-400">
            Legal Document
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
            Application: <strong className="font-semibold">Space Royale</strong>
            <span className="mx-2">·</span>
            Last Updated: <strong className="font-semibold">{LAST_UPDATED}</strong>
          </p>
        </header>

        {/* Body */}
        <article className="space-y-10 text-[15px] leading-7 text-neutral-800 sm:text-base dark:text-neutral-300">
          <Section title="Agreement to Terms">
            <p>
              These Terms of Service (&ldquo;Terms&rdquo;) govern your access
              to and use of Space Royale (&ldquo;the Application,&rdquo;
              &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), an
              Android mobile game available on the Google Play Store. By
              downloading, installing, or playing the Application, you agree
              to be bound by these Terms. If you do not agree to these Terms,
              please do not use the Application.
            </p>
          </Section>

          <Section title="License to Use">
            <p>
              Subject to your compliance with these Terms, we grant you a
              limited, non-exclusive, non-transferable, revocable license to
              download and use the Application on a device that you own or
              control, solely for your personal, non-commercial use.
            </p>
            <p>
              You may not copy, modify, distribute, sell, lease, reverse
              engineer, or create derivative works based on the Application,
              except to the extent such restriction is prohibited by
              applicable law.
            </p>
          </Section>

          <Section title="Acceptable Use">
            <p>You agree not to:</p>
            <ul className="list-disc space-y-2 pl-6 marker:text-neutral-400">
              <li>Use the Application for any unlawful purpose or in violation of these Terms</li>
              <li>Attempt to gain unauthorized access to the Application, its systems, or related networks</li>
              <li>Interfere with or disrupt the operation of the Application</li>
              <li>Use any automated system, such as a bot or scraper, to access the Application</li>
              <li>Remove, obscure, or alter any proprietary notices contained in the Application</li>
            </ul>
          </Section>

          <Section title="Intellectual Property">
            <p>
              The Application, including its code, design, graphics, text,
              and other content, is owned by us or our licensors and is
              protected by copyright, trademark, and other intellectual
              property laws. Except for the limited license granted above, no
              right, title, or interest in the Application is transferred to
              you.
            </p>
          </Section>

          <Section title="Disclaimer of Warranties">
            <p>
              The Application is provided &ldquo;as is&rdquo; and &ldquo;as
              available,&rdquo; without warranties of any kind, whether
              express or implied, including but not limited to implied
              warranties of merchantability, fitness for a particular
              purpose, and non-infringement. We do not warrant that the
              Application will be uninterrupted, error-free, or free of
              harmful components.
            </p>
          </Section>

          <Section title="Limitation of Liability">
            <p>
              To the fullest extent permitted by applicable law, we shall not
              be liable for any indirect, incidental, special, consequential,
              or punitive damages, or any loss of data, arising out of or
              related to your use of, or inability to use, the Application,
              even if we have been advised of the possibility of such
              damages.
            </p>
          </Section>

          <Section title="Termination">
            <p>
              We may suspend or terminate your access to the Application at
              any time, without notice, if you fail to comply with these
              Terms. You may stop using the Application at any time by
              uninstalling it from your device.
            </p>
          </Section>

          <Section title="Changes to These Terms">
            <p>
              We may update these Terms from time to time to reflect changes
              in the Application or applicable law. When we do, we will
              revise the &ldquo;Last Updated&rdquo; date at the top of this
              page. Your continued use of the Application after any changes
              constitutes your acceptance of the revised Terms.
            </p>
          </Section>

          <Section title="Governing Law">
            <p>
              These Terms shall be governed by and construed in accordance
              with the laws of the jurisdiction in which we operate, without
              regard to its conflict of law provisions.
            </p>
          </Section>

          <Section title="Contact Information">
            <p>
              If you have any questions about these Terms, please contact us
              at:
            </p>
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 px-5 py-4 font-mono text-sm dark:border-neutral-800 dark:bg-neutral-900">
              <p className="mb-1 text-neutral-500 dark:text-neutral-400">Email:</p>
              <p className="text-indigo-600 dark:text-indigo-400">{CONTACT_EMAIL}</p>
            </div>
          </Section>
        </article>

        {/* Footer */}
        <footer className="mt-16 border-t border-neutral-200 pt-6 text-center text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-500">
          <p>Space Royale &copy; 2026. All rights reserved.</p>
          <p className="mt-1">These Terms of Service are effective as of {LAST_UPDATED}.</p>
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
