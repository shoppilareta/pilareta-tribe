export function Footer() {
  return (
    <footer className="site-footer">
      <p style={{ marginBottom: '0.75rem' }}>
        Need help? Reach out to us
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
        <a
          href="https://wa.me/919910220744?text=Hi%20Pilareta"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          WhatsApp
        </a>
        <a href="mailto:shop@pilareta.com">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 6l-10 7L2 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          shop@pilareta.com
        </a>
      </div>
      <p style={{ fontSize: '0.75rem', color: 'rgba(246, 237, 221, 0.3)', marginTop: '1.5rem', paddingBottom: '2rem' }}>
        Pilareta Tribe
      </p>
    </footer>
  );
}
