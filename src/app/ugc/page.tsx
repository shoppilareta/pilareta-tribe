import Link from 'next/link';

export default function UgcPage() {
  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
      <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="badge-coming-soon" style={{ marginBottom: '1rem', display: 'inline-block' }}>Coming Soon</span>
          <h1 style={{ marginBottom: '1rem' }}>Community</h1>
          <p style={{ color: 'rgba(246, 237, 221, 0.6)', maxWidth: '28rem', margin: '0 auto' }}>
            Share your Pilates journey. Connect with fellow enthusiasts and
            inspire others with your progress.
          </p>
        </div>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '3rem', height: '3rem', background: 'rgba(246, 237, 221, 0.1)', borderRadius: '9999px' }} />
            <div style={{ flex: 1 }}>
              <input
                type="text"
                placeholder="Share your Pilates moment..."
                disabled
                style={{ opacity: 0.6 }}
              />
            </div>
            <button className="btn btn-primary" style={{ opacity: 0.6 }} disabled>
              Post
            </button>
          </div>

          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'rgba(246, 237, 221, 0.6)' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.6, background: 'none', border: 'none', color: 'inherit', cursor: 'not-allowed' }} disabled>
              <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Photo
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.6, background: 'none', border: 'none', color: 'inherit', cursor: 'not-allowed' }} disabled>
              <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Video
            </button>
          </div>
        </div>

        <h2 style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '1rem' }}>Community Feed</h2>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div key={i} className="card" style={{ padding: 0, overflow: 'hidden', opacity: 0.5 }}>
              <div style={{ aspectRatio: '1', background: 'rgba(246, 237, 221, 0.05)' }} />
              <div style={{ padding: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div style={{ width: '1.5rem', height: '1.5rem', background: 'rgba(246, 237, 221, 0.1)', borderRadius: '9999px' }} />
                  <div style={{ height: '0.75rem', background: 'rgba(246, 237, 221, 0.1)', borderRadius: '0.25rem', width: '5rem' }} />
                </div>
                <div style={{ height: '0.5rem', background: 'rgba(246, 237, 221, 0.1)', borderRadius: '0.25rem', width: '100%', marginBottom: '0.25rem' }} />
                <div style={{ height: '0.5rem', background: 'rgba(246, 237, 221, 0.1)', borderRadius: '0.25rem', width: '66%' }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link href="/" className="btn btn-outline">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
