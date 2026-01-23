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

// Compact version for grid cards - renders actual embed scaled to fit
export function InstagramEmbedCompact({ url, postId }: { url: string; postId?: string | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Load Instagram embed script if not already loaded
    const loadScript = () => {
      if (document.querySelector('script[src*="instagram.com/embed.js"]')) {
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
      };
      document.body.appendChild(script);
    };

    loadScript();

    // Check periodically if the embed has loaded
    const checkLoaded = setInterval(() => {
      if (containerRef.current) {
        const iframe = containerRef.current.querySelector('iframe');
        if (iframe) {
          setLoaded(true);
          clearInterval(checkLoaded);
        }
      }
    }, 500);

    const timeout = setTimeout(() => {
      clearInterval(checkLoaded);
      setLoaded(true); // Show whatever we have after timeout
    }, 5000);

    return () => {
      clearInterval(checkLoaded);
      clearTimeout(timeout);
    };
  }, [url]);

  // Re-process when URL changes
  useEffect(() => {
    if (window.instgrm) {
      setTimeout(() => {
        window.instgrm?.Embeds.process();
      }, 100);
    }
  }, [url]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: '#1a1a1a',
      }}
    >
      {/* Loading placeholder */}
      {!loaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCAF45 100%)',
            zIndex: 1,
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.5"
          >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
          </svg>
          <p style={{ margin: '8px 0 0', fontSize: '0.7rem', color: 'white', fontWeight: 500 }}>
            Loading...
          </p>
        </div>
      )}

      {/* Scaled embed container */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) scale(0.5)',
          transformOrigin: 'center center',
          width: '400px',
          minHeight: '400px',
        }}
      >
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={url}
          data-instgrm-version="14"
          style={{
            background: '#1a1a1a',
            border: 0,
            borderRadius: '4px',
            boxShadow: 'none',
            margin: 0,
            padding: 0,
            width: '100%',
          }}
        />
      </div>

      {/* Instagram badge overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          right: '8px',
          background: 'rgba(0, 0, 0, 0.6)',
          borderRadius: '4px',
          padding: '4px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          zIndex: 2,
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1.5"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      </div>
    </div>
  );
}
