import Link from 'next/link';

export default function StudioLocatorPage() {
  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
      <div style={{ maxWidth: '42rem', margin: '0 auto', textAlign: 'center' }}>
        <span className="badge-coming-soon" style={{ marginBottom: '1rem', display: 'inline-block' }}>Coming Soon</span>
        <h1 style={{ marginBottom: '1rem' }}>Studio Locator</h1>
        <p style={{ color: 'rgba(246, 237, 221, 0.6)', marginBottom: '2rem', maxWidth: '28rem', margin: '0 auto 2rem' }}>
          Find Pilates studios near you. Search by location, filter by
          amenities, and discover your perfect practice space.
        </p>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Enter your location..."
                style={{ paddingRight: '2.5rem' }}
                disabled
              />
              <svg
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', opacity: 0.5 }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              {['Reformer', 'Mat Classes', 'Private Sessions', 'Group Classes'].map(
                (filter) => (
                  <span
                    key={filter}
                    style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', background: 'rgba(246, 237, 221, 0.05)', borderRadius: '9999px', opacity: 0.6 }}
                  >
                    {filter}
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card" style={{ textAlign: 'left', opacity: 0.5 }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ width: '4rem', height: '4rem', background: 'rgba(246, 237, 221, 0.1)', borderRadius: '0.5rem', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: '1rem', background: 'rgba(246, 237, 221, 0.1)', borderRadius: '0.25rem', width: '75%', marginBottom: '0.5rem' }} />
                  <div style={{ height: '0.75rem', background: 'rgba(246, 237, 221, 0.1)', borderRadius: '0.25rem', width: '50%', marginBottom: '0.25rem' }} />
                  <div style={{ height: '0.75rem', background: 'rgba(246, 237, 221, 0.1)', borderRadius: '0.25rem', width: '66%' }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2rem' }}>
          <Link href="/" className="btn btn-outline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
