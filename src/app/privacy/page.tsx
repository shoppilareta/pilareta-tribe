import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Pilareta Tribe',
  description: 'Privacy Policy for the Pilareta Tribe app and website.',
};

export default function PrivacyPolicy() {
  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <div style={{ maxWidth: '42rem', margin: '0 auto', lineHeight: 1.8 }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 500, marginBottom: '0.5rem' }}>Privacy Policy</h1>
        <p style={{ color: 'rgba(246, 237, 221, 0.5)', marginBottom: '2rem', fontSize: '0.875rem' }}>
          Last updated: April 4, 2026
        </p>

        <Section title="1. Introduction">
          Pilareta Tribe ("we", "our", "us") operates the Pilareta Tribe mobile application and
          the website at tribe.pilareta.com (the "Service"). This Privacy Policy explains how we
          collect, use, and protect your personal information when you use our Service.
        </Section>

        <Section title="2. Information We Collect">
          <BulletList items={[
            'Account information: When you sign in via Shopify or Apple Sign-In, we receive your email address and name.',
            'Workout data: Workout logs you create, including type, duration, RPE, focus areas, and optional photos.',
            'Community content: Posts, comments, likes, and media you share in the community feed.',
            'Device information: Device type, operating system, and push notification tokens for sending notifications.',
            'Location data: Only when you use the studio locator feature and grant location permission. We do not track your location in the background.',
            'Health data: If you opt in, we sync workout data with Apple Health or Google Health Connect. This data stays on your device and is never sent to our servers.',
          ]} />
        </Section>

        <Section title="3. How We Use Your Information">
          <BulletList items={[
            'To provide and maintain the Service, including workout tracking, session building, and community features.',
            'To display your profile and content to other users when you choose to share.',
            'To send push notifications (streak reminders, social interactions) that you can disable at any time.',
            'To improve the Service through aggregated, anonymized usage analytics.',
            'To moderate community content and enforce our community guidelines.',
          ]} />
        </Section>

        <Section title="4. Data Sharing">
          We do not sell your personal data. We share data only in these limited circumstances:
          <BulletList items={[
            'Shopify: For authentication and order processing when you shop.',
            'Google Maps: Your search queries when using the studio locator (not your precise location).',
            'Expo: Push notification delivery tokens.',
            'Legal requirements: If required by law or to protect the rights and safety of our users.',
          ]} />
        </Section>

        <Section title="5. Data Storage and Security">
          Your data is stored on secure servers hosted on Amazon Web Services (AWS) in the
          Asia Pacific (Mumbai) region. We use encryption in transit (HTTPS/TLS), secure session
          management, and access controls to protect your information. Uploaded media (photos,
          videos) is stored securely and backed up regularly.
        </Section>

        <Section title="6. Your Rights">
          You have the right to:
          <BulletList items={[
            'Access your personal data through your account profile and workout history.',
            'Delete your account and associated data by contacting us.',
            'Opt out of push notifications through your device settings.',
            'Withdraw location permission at any time through your device settings.',
            'Request a copy of your data by contacting us.',
          ]} />
        </Section>

        <Section title="7. Data Retention">
          We retain your data for as long as your account is active. Workout logs, community posts,
          and profile information are kept until you delete them or request account deletion.
          Deleted content may be retained in backups for up to 30 days.
        </Section>

        <Section title="8. Children's Privacy">
          The Service is not intended for children under 13. We do not knowingly collect personal
          information from children under 13. If you believe a child has provided us with personal
          data, please contact us.
        </Section>

        <Section title="9. Changes to This Policy">
          We may update this Privacy Policy from time to time. We will notify you of any material
          changes by posting the new policy on this page and updating the "Last updated" date.
        </Section>

        <Section title="10. Contact Us">
          If you have questions about this Privacy Policy or your data, contact us at:{' '}
          <a href="mailto:shoppilareta@gmail.com" style={{ color: 'rgba(246, 237, 221, 0.9)', textDecoration: 'underline' }}>
            shoppilareta@gmail.com
          </a>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '0.75rem' }}>{title}</h2>
      <div style={{ color: 'rgba(246, 237, 221, 0.8)', fontSize: '0.9375rem' }}>{children}</div>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul style={{ paddingLeft: '1.25rem', marginTop: '0.5rem' }}>
      {items.map((item, i) => (
        <li key={i} style={{ marginBottom: '0.5rem' }}>{item}</li>
      ))}
    </ul>
  );
}
