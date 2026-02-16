'use client';

import { useEffect, useState, useCallback } from 'react';

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  linkText: string | null;
  position: number;
}

export function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    fetch('/api/shop/banners')
      .then((r) => r.json())
      .then((d) => setBanners(d.banners ?? []))
      .catch(() => {});
  }, []);

  // Auto-advance every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const goTo = useCallback((idx: number) => setCurrent(idx), []);

  if (banners.length === 0) return null;

  const banner = banners[current];

  return (
    <div style={{ position: 'relative', width: '100%', marginBottom: '2rem', borderRadius: '0.75rem', overflow: 'hidden' }}>
      {/* Banner image */}
      <div
        style={{
          width: '100%',
          aspectRatio: '3 / 1',
          backgroundImage: `url(${banner.imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 0.5s ease',
          position: 'relative',
        }}
      >
        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(32,34,25,0.8) 0%, rgba(32,34,25,0.3) 60%, transparent 100%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '2rem',
            maxWidth: '50%',
          }}
        >
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem', lineHeight: 1.2 }}>
            {banner.title}
          </h2>
          {banner.subtitle && (
            <p style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '1rem' }}>
              {banner.subtitle}
            </p>
          )}
          {banner.linkUrl && (
            <a
              href={banner.linkUrl}
              className="btn-primary"
              style={{ alignSelf: 'flex-start', fontSize: '0.875rem', padding: '0.5rem 1.25rem' }}
            >
              {banner.linkText || 'Shop Now'}
            </a>
          )}
        </div>
      </div>

      {/* Navigation arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((prev) => (prev - 1 + banners.length) % banners.length)}
            style={{
              position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(32,34,25,0.6)', border: 'none', color: '#f6eddd',
              width: '2rem', height: '2rem', borderRadius: '50%', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
            }}
            aria-label="Previous banner"
          >
            &#8249;
          </button>
          <button
            onClick={() => setCurrent((prev) => (prev + 1) % banners.length)}
            style={{
              position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)',
              background: 'rgba(32,34,25,0.6)', border: 'none', color: '#f6eddd',
              width: '2rem', height: '2rem', borderRadius: '50%', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
            }}
            aria-label="Next banner"
          >
            &#8250;
          </button>
        </>
      )}

      {/* Dots */}
      {banners.length > 1 && (
        <div style={{ position: 'absolute', bottom: '0.75rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem' }}>
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === current ? '1.5rem' : '0.5rem',
                height: '0.5rem',
                borderRadius: '0.25rem',
                background: i === current ? '#f6eddd' : 'rgba(246,237,221,0.4)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0,
              }}
              aria-label={`Go to banner ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
