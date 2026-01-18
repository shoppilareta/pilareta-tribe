import Link from 'next/link';
import { ReactNode } from 'react';

interface HomeTileProps {
  title: string;
  description: string;
  href: string;
  children?: ReactNode;
  comingSoon?: boolean;
}

export function HomeTile({
  title,
  description,
  href,
  children,
  comingSoon = true,
}: HomeTileProps) {
  return (
    <section className="card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 500, marginBottom: '0.25rem' }}>{title}</h2>
          <p style={{ color: 'rgba(246, 237, 221, 0.6)', fontSize: '0.875rem' }}>{description}</p>
        </div>
        {comingSoon && (
          <span className="badge-coming-soon">Coming Soon</span>
        )}
      </div>

      <div style={{ marginTop: '1.5rem' }}>{children}</div>

      <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid rgba(246, 237, 221, 0.1)' }}>
        <Link href={href} className="btn btn-outline" style={{ width: '100%', fontSize: '0.875rem', padding: '0.75rem' }}>
          Explore {title}
        </Link>
      </div>
    </section>
  );
}
