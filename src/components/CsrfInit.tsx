'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    __csrfToken?: string;
  }
}

/**
 * Client component that fetches a CSRF token on mount and stores it on
 * `window.__csrfToken` so that fetch calls can include the `x-csrf-token`
 * header for mutation requests.
 */
export function CsrfInit() {
  useEffect(() => {
    fetch('/api/csrf')
      .then((res) => res.json())
      .then((data: { token: string }) => {
        window.__csrfToken = data.token;
      })
      .catch(() => {
        // Non-critical — CSRF token will be fetched again on next page load
      });
  }, []);

  return null;
}
