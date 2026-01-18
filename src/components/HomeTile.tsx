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
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-medium mb-1">{title}</h2>
          <p className="text-muted text-sm">{description}</p>
        </div>
        {comingSoon && (
          <span className="badge-coming-soon">Coming Soon</span>
        )}
      </div>

      <div className="mt-6">{children}</div>

      <div className="mt-6 pt-4 border-t border-[rgba(246,237,221,0.1)]">
        <Link href={href} className="btn btn-outline w-full text-sm py-3">
          Explore {title}
        </Link>
      </div>
    </section>
  );
}
