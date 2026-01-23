'use client';

import { useEffect, useRef, useState } from 'react';

interface InstagramEmbedProps {
  url: string;
  postId?: string | null;
  maxWidth?: number;
}

// Declare Instagram embed script global
declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}

export function InstagramEmbed({ url, postId, maxWidth = 400 }: InstagramEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Load Instagram embed script if not already loaded
    const loadInstagramScript = () => {
      if (document.querySelector('script[src*="instagram.com/embed.js"]')) {
        // Script already loaded, just process
        if (window.instgrm) {
          window.instgrm.Embeds.process();
        }
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      script.onload = () => {
        if (window.instgrm) {
          window.instgrm.Embeds.process();
        }
        setLoading(false);
      };
      script.onerror = () => {
        setError(true);
        setLoading(false);
      };
      document.body.appendChild(script);
    };

    loadInstagramScript();

    // Small delay to allow embed to render
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [url]);

  // Re-process when URL changes
  useEffect(() => {
    if (window.instgrm) {
      window.instgrm.Embeds.process();
    }
  }, [url]);

  if (error) {
    return (
      <div
        style={{
          width: '100%',
          aspectRatio: '1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(246, 237, 221, 0.05)',
          borderRadius: '4px',
          padding: '1rem',
          textAlign: 'center',
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(246, 237, 221, 0.4)"
          strokeWidth="1.5"
          style={{ marginBottom: '8px' }}
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'rgba(246, 237, 221, 0.6)' }}>
          Could not load Instagram post
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginTop: '8px',
            fontSize: '0.75rem',
            color: 'rgba(246, 237, 221, 0.5)',
            textDecoration: 'underline',
          }}
        >
          View on Instagram
        </a>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        maxWidth: maxWidth,
        margin: '0 auto',
        minHeight: loading ? '300px' : undefined,
        position: 'relative',
      }}
    >
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(246, 237, 221, 0.05)',
            borderRadius: '4px',
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(246, 237, 221, 0.4)"
            strokeWidth="2"
            style={{ animation: 'spin 1s linear infinite' }}
          >
            <circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" />
          </svg>
          <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.5)' }}>
            Loading Instagram post...
          </p>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
      <blockquote
        className="instagram-media"
        data-instgrm-captioned
        data-instgrm-permalink={url}
        data-instgrm-version="14"
        style={{
          background: '#1a1a1a',
          border: 0,
          borderRadius: '4px',
          boxShadow: 'none',
          margin: 0,
          maxWidth: '100%',
          minWidth: '100%',
          padding: 0,
          width: '100%',
        }}
      />
    </div>
  );
}

// Compact version for grid cards
export function InstagramEmbedCompact({ url, postId }: { url: string; postId?: string | null }) {
  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '1',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCAF45 100%)',
        borderRadius: '4px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="1.5"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
      <p
        style={{
          margin: '8px 0 0',
          fontSize: '0.75rem',
          color: 'white',
          fontWeight: 500,
        }}
      >
        Instagram Post
      </p>
    </div>
  );
}
