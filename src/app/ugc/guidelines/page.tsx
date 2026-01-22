import Link from 'next/link';

export default function CommunityGuidelinesPage() {
  return (
    <div
      style={{
        minHeight: 'calc(100vh - 4rem)',
        background: '#1a1a1a',
        padding: '2rem 1rem',
      }}
    >
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        {/* Back link */}
        <Link
          href="/ugc"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'rgba(246, 237, 221, 0.6)',
            textDecoration: 'none',
            fontSize: '0.875rem',
            marginBottom: '2rem',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Community
        </Link>

        {/* Header */}
        <h1
          style={{
            margin: '0 0 0.5rem',
            fontSize: '1.75rem',
            fontWeight: 400,
            color: '#f6eddd',
            letterSpacing: '-0.02em',
          }}
        >
          Community Guidelines
        </h1>
        <p
          style={{
            margin: '0 0 2rem',
            color: 'rgba(246, 237, 221, 0.6)',
          }}
        >
          Creating a positive space for our Pilates community
        </p>

        {/* Guidelines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Section 1 */}
          <section>
            <h2
              style={{
                margin: '0 0 0.75rem',
                fontSize: '1.125rem',
                fontWeight: 500,
                color: '#f6eddd',
              }}
            >
              What We Welcome
            </h2>
            <ul
              style={{
                margin: 0,
                padding: '0 0 0 1.25rem',
                color: 'rgba(246, 237, 221, 0.8)',
                lineHeight: 1.7,
              }}
            >
              <li>Photos and videos of your Pilates practice</li>
              <li>Progress updates and fitness journey milestones</li>
              <li>Studio visits and workout environments</li>
              <li>Equipment setups and home studio spaces</li>
              <li>Supportive and encouraging comments</li>
              <li>Tips and insights from your practice</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <h2
              style={{
                margin: '0 0 0.75rem',
                fontSize: '1.125rem',
                fontWeight: 500,
                color: '#f6eddd',
              }}
            >
              Content Requirements
            </h2>
            <ul
              style={{
                margin: 0,
                padding: '0 0 0 1.25rem',
                color: 'rgba(246, 237, 221, 0.8)',
                lineHeight: 1.7,
              }}
            >
              <li>Content must be your own original work</li>
              <li>You must have permission to share any content featuring other people</li>
              <li>Images: JPEG, PNG, or WebP format (max 10MB)</li>
              <li>Videos: MP4, MOV, or WebM format (max 100MB)</li>
              <li>Keep content appropriate for all audiences</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2
              style={{
                margin: '0 0 0.75rem',
                fontSize: '1.125rem',
                fontWeight: 500,
                color: '#f6eddd',
              }}
            >
              Not Allowed
            </h2>
            <ul
              style={{
                margin: 0,
                padding: '0 0 0 1.25rem',
                color: 'rgba(246, 237, 221, 0.8)',
                lineHeight: 1.7,
              }}
            >
              <li>Explicit, violent, or offensive content</li>
              <li>Spam, advertising, or promotional content</li>
              <li>Harassment, bullying, or negative comments about others</li>
              <li>Content that infringes on copyrights or trademarks</li>
              <li>False or misleading health claims</li>
              <li>Personal information of others without consent</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section>
            <h2
              style={{
                margin: '0 0 0.75rem',
                fontSize: '1.125rem',
                fontWeight: 500,
                color: '#f6eddd',
              }}
            >
              Moderation Process
            </h2>
            <p
              style={{
                margin: 0,
                color: 'rgba(246, 237, 221, 0.8)',
                lineHeight: 1.7,
              }}
            >
              All submissions are reviewed by our team before being published to ensure they meet
              our community standards. This process typically takes 24-48 hours. We reserve the
              right to remove any content that violates these guidelines.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2
              style={{
                margin: '0 0 0.75rem',
                fontSize: '1.125rem',
                fontWeight: 500,
                color: '#f6eddd',
              }}
            >
              Rate Limits
            </h2>
            <p
              style={{
                margin: 0,
                color: 'rgba(246, 237, 221, 0.8)',
                lineHeight: 1.7,
              }}
            >
              To maintain community quality, uploads are limited to:
            </p>
            <ul
              style={{
                margin: '0.5rem 0 0',
                padding: '0 0 0 1.25rem',
                color: 'rgba(246, 237, 221, 0.8)',
                lineHeight: 1.7,
              }}
            >
              <li>5 posts per hour</li>
              <li>20 posts per day</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section>
            <h2
              style={{
                margin: '0 0 0.75rem',
                fontSize: '1.125rem',
                fontWeight: 500,
                color: '#f6eddd',
              }}
            >
              Your Rights
            </h2>
            <p
              style={{
                margin: 0,
                color: 'rgba(246, 237, 221, 0.8)',
                lineHeight: 1.7,
              }}
            >
              By posting content, you grant Pilareta Tribe a non-exclusive license to display your
              content on our platform. You retain all ownership rights to your original content.
              You can delete your posts at any time.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: '3rem',
            paddingTop: '2rem',
            borderTop: '1px solid rgba(246, 237, 221, 0.1)',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              margin: '0 0 1rem',
              color: 'rgba(246, 237, 221, 0.6)',
              fontSize: '0.875rem',
            }}
          >
            Questions about our guidelines?
          </p>
          <a
            href="mailto:hello@pilareta.com"
            style={{
              color: '#f59e0b',
              textDecoration: 'none',
            }}
          >
            Contact us
          </a>
        </div>
      </div>
    </div>
  );
}
