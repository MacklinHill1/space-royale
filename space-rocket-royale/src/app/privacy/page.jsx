'use client';

export default function PrivacyPolicy() {
  return (
    <main style={{
      minHeight: '100vh',
      background: '#030712',
      color: '#e2e8f0',
      fontFamily: "'Georgia', 'Times New Roman', serif",
      padding: '48px 24px',
    }}>
      <div style={{
        maxWidth: 760,
        margin: '0 auto',
        lineHeight: 1.8,
      }}>

        {/* Header */}
        <div style={{ marginBottom: 48, borderBottom: '1px solid #1e293b', paddingBottom: 32 }}>
          <p style={{ fontSize: 13, color: '#64748b', letterSpacing: 2, marginBottom: 8, fontFamily: 'monospace' }}>
            LEGAL DOCUMENT
          </p>
          <h1 style={{ fontSize: 36, fontWeight: 700, color: '#f1f5f9', margin: '0 0 12px', fontFamily: 'system-ui, sans-serif' }}>
            Privacy Policy
          </h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: 0 }}>
            Application: <strong style={{ color: '#94a3b8' }}>Space Royale</strong>
            &ensp;·&ensp;
            Last Updated: <strong style={{ color: '#94a3b8' }}>June 22, 2026</strong>
          </p>
        </div>

        {/* Introduction */}
        <Section title="Introduction">
          <p>
            This Privacy Policy describes how Space Royale ("the Application," "we," "us," or "our") handles
            information when you use our Android mobile game available on the Google Play Store. We are
            committed to protecting your privacy. Please read this policy carefully to understand our
            practices.
          </p>
          <p>
            By downloading, installing, or playing Space Royale, you acknowledge that you have read and
            understood this Privacy Policy.
          </p>
        </Section>

        {/* Information Collection and Use */}
        <Section title="Information Collection and Use">
          <p>
            <strong>Space Royale does not collect, transmit, store, or share any personally identifiable
            information.</strong> The Application does not require you to create an account, log in, or
            provide any personal details to play.
          </p>
          <p>Specifically, the Application does <strong>not</strong> collect:</p>
          <BulletList items={[
            'Your name, email address, phone number, or any contact information',
            'Your location or GPS data',
            'Device identifiers such as IMEI, advertising ID, or MAC address',
            'Financial information or payment details',
            'Contacts, calendar entries, photos, or files from your device',
            'Usage analytics, crash reports, or performance telemetry beyond any basic services required by the Android operating system or Google Play platform',
            'Any user-generated content (the Application contains no chat, messaging, or content submission features)',
          ]} />
          <p>
            All game progress and settings (such as your score history, upgrades, and preferences) are
            stored exclusively on your device using local device storage. This data never leaves your
            device and is not accessible to us.
          </p>
        </Section>

        {/* Third-Party Services */}
        <Section title="Third-Party Services">
          <p>
            Space Royale does not integrate third-party advertising networks, analytics platforms, social
            media SDKs, or any other third-party data collection services.
          </p>
          <p>
            The Application is distributed through the Google Play Store. When you download or install the
            Application, Google Play's own terms of service and privacy policy apply to that transaction.
            We have no control over the data Google may collect as part of operating the Google Play
            platform. We encourage you to review Google's Privacy Policy at{' '}
            <a
              href="https://policies.google.com/privacy"
              style={{ color: '#818cf8', textDecoration: 'underline' }}
              target="_blank"
              rel="noopener noreferrer"
            >
              https://policies.google.com/privacy
            </a>.
          </p>
          <p>
            Beyond the Google Play Store distribution channel, no third-party services, SDKs, or
            frameworks are embedded in the Application that collect user data.
          </p>
        </Section>

        {/* Children's Privacy */}
        <Section title="Children's Privacy">
          <p>
            Space Royale is intended for a general audience and is designed to be suitable for players of
            all ages. The Application does not knowingly collect personal information from children under
            the age of 13 (or the applicable age of digital consent in your jurisdiction).
          </p>
          <p>
            Because the Application collects no personal information from any user, it presents no
            specific privacy risk to children. No account creation is required, no personal data is
            solicited, and no user data is transmitted from the device.
          </p>
          <p>
            If you are a parent or guardian and believe your child has somehow provided personal
            information through the Application, please contact us at the address listed below and we will
            take prompt steps to investigate and address your concern.
          </p>
        </Section>

        {/* Data Security */}
        <Section title="Data Security">
          <p>
            Because Space Royale does not collect or transmit any personal information, there is no
            personal data at risk of unauthorized access, disclosure, alteration, or destruction on our
            servers or systems.
          </p>
          <p>
            Game progress data stored locally on your device is subject to the security protections
            provided by your Android device and operating system, including any screen lock, encryption,
            or application sandboxing features you have enabled. We recommend keeping your device's
            operating system up to date and enabling device security features to protect all data stored
            on your device.
          </p>
        </Section>

        {/* Data Retention */}
        <Section title="Data Retention">
          <p>
            We do not retain any personal data because we do not collect any. Local game data stored on
            your device (such as saved game progress) remains on your device until you uninstall the
            Application or manually clear its data through your device's application settings.
            Uninstalling the Application will remove all locally stored game data.
          </p>
        </Section>

        {/* Changes to This Privacy Policy */}
        <Section title="Changes to This Privacy Policy">
          <p>
            We may update this Privacy Policy from time to time. When we do, we will revise the
            "Last Updated" date at the top of this page. If material changes are made, we will notify
            users through an updated version of the Application on the Google Play Store.
          </p>
          <p>
            Your continued use of the Application after any changes to this Privacy Policy constitutes
            your acceptance of the updated policy. We encourage you to review this Privacy Policy
            periodically to stay informed about how we protect your privacy.
          </p>
        </Section>

        {/* Contact Information */}
        <Section title="Contact Information">
          <p>
            If you have any questions, concerns, or requests regarding this Privacy Policy or the
            privacy practices of Space Royale, please contact us at:
          </p>
          <div style={{
            background: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: 8,
            padding: '20px 24px',
            margin: '16px 0',
            fontFamily: 'monospace',
            fontSize: 14,
          }}>
            <p style={{ margin: '0 0 4px', color: '#94a3b8' }}>Email:</p>
            <p style={{ margin: 0, color: '#818cf8' }}>[YOUR_CONTACT_EMAIL@EXAMPLE.COM]</p>
          </div>
          <p>
            We will make reasonable efforts to respond to your inquiry within 30 days of receipt.
          </p>
        </Section>

        {/* Footer */}
        <div style={{
          marginTop: 64,
          paddingTop: 24,
          borderTop: '1px solid #1e293b',
          textAlign: 'center',
          color: '#334155',
          fontSize: 13,
          fontFamily: 'monospace',
        }}>
          <p style={{ margin: 0 }}>Space Royale &copy; 2026 &nbsp;·&nbsp; All rights reserved</p>
          <p style={{ margin: '8px 0 0' }}>This privacy policy is effective as of June 22, 2026</p>
        </div>

      </div>
    </main>
  );
}

function Section({ title, children }) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2 style={{
        fontSize: 20,
        fontWeight: 700,
        color: '#c4b5fd',
        fontFamily: 'system-ui, sans-serif',
        margin: '0 0 16px',
        paddingBottom: 8,
        borderBottom: '1px solid #1e293b',
      }}>
        {title}
      </h2>
      <div style={{ color: '#cbd5e1', fontSize: 15 }}>
        {children}
      </div>
    </section>
  );
}

function BulletList({ items }) {
  return (
    <ul style={{ paddingLeft: 20, margin: '12px 0', color: '#94a3b8' }}>
      {items.map((item, i) => (
        <li key={i} style={{ marginBottom: 8, lineHeight: 1.6 }}>{item}</li>
      ))}
    </ul>
  );
}
