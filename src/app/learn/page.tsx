import Link from 'next/link';

const categories = [
  { name: 'Beginner', description: 'Start your Pilates journey', icon: '🌱' },
  { name: 'Intermediate', description: 'Build on your foundation', icon: '🌿' },
  { name: 'Advanced', description: 'Challenge yourself', icon: '🌳' },
  { name: 'Mat Work', description: 'Classic floor exercises', icon: '🧘' },
  { name: 'Reformer', description: 'Equipment-based training', icon: '💪' },
  { name: 'Recovery', description: 'Gentle restoration', icon: '🌸' },
];

export default function LearnPage() {
  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
      <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <span className="badge-coming-soon" style={{ marginBottom: '1rem', display: 'inline-block' }}>Coming Soon</span>
          <h1 style={{ marginBottom: '1rem' }}>Learn Pilates</h1>
          <p style={{ color: 'rgba(246, 237, 221, 0.6)', maxWidth: '28rem', margin: '0 auto' }}>
            Explore tutorials and techniques for all levels. From beginner
            basics to advanced sequences.
          </p>
        </div>

        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '2rem' }}>
          {categories.map((category) => (
            <div
              key={category.name}
              className="card"
              style={{ opacity: 0.6, cursor: 'not-allowed' }}
            >
              <div style={{ fontSize: '1.875rem', marginBottom: '0.75rem' }}>{category.icon}</div>
              <h3 style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{category.name}</h3>
              <p style={{ fontSize: '0.875rem', color: 'rgba(246, 237, 221, 0.6)' }}>{category.description}</p>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: '1rem' }}>Featured Content</h2>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{ display: 'flex', gap: '0.75rem', padding: '0.75rem', borderRadius: '0.5rem', background: 'rgba(246, 237, 221, 0.05)', opacity: 0.5 }}
              >
                <div style={{ width: '5rem', height: '3.5rem', background: 'rgba(246, 237, 221, 0.1)', borderRadius: '0.25rem', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ height: '0.75rem', background: 'rgba(246, 237, 221, 0.1)', borderRadius: '0.25rem', width: '75%', marginBottom: '0.5rem' }} />
                  <div style={{ height: '0.5rem', background: 'rgba(246, 237, 221, 0.1)', borderRadius: '0.25rem', width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
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
