/**
 * Admin fetch helper — wraps fetch with CSRF token for all mutating requests.
 * Use this in all admin components instead of raw fetch().
 */

declare global {
  interface Window {
    __csrfToken?: string;
  }
}

function getCsrfToken(): string {
  if (typeof window !== 'undefined') {
    // Try window global first (set by CsrfInit)
    if (window.__csrfToken) return window.__csrfToken;
    // Fallback: read from cookie directly
    const match = document.cookie.match(/pilareta-csrf-token=([^;]+)/);
    if (match) return match[1];
  }
  return '';
}

export async function adminFetch(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const method = options?.method?.toUpperCase() || 'GET';
  const isMutating = method !== 'GET' && method !== 'HEAD';

  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string>),
  };

  // Add CSRF token for all mutating requests
  if (isMutating) {
    headers['x-csrf-token'] = getCsrfToken();
  }

  // Default to JSON content type for mutating requests with a body
  if (isMutating && options?.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(url, { ...options, headers });
}
