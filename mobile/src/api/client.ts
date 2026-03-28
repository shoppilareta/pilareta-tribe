import { useAuthStore } from '@/stores/authStore';

const API_BASE = __DEV__
  ? 'http://localhost:3000'
  : 'https://tribe.pilareta.com';

class ApiError extends Error {
  constructor(
    public status: number,
    public data: unknown
  ) {
    super(`API Error ${status}`);
    this.name = 'ApiError';
  }
}

class AuthError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthError';
  }
}

class NetworkError extends Error {
  constructor(message = 'No internet connection. Please check your network and try again.') {
    super(message);
    this.name = 'NetworkError';
  }
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshTokenIfNeeded(): Promise<string | null> {
  // Reuse in-flight refresh to avoid concurrent refresh race conditions
  if (refreshPromise) return refreshPromise;

  refreshPromise = doRefresh().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

async function doRefresh(): Promise<string | null> {
  const { refreshToken, setTokens, logout } = useAuthStore.getState();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE}/api/auth/mobile/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      // Only logout on definitive auth failures (401/403), not on server errors
      if (response.status === 401 || response.status === 403) {
        await logout();
      }
      return null;
    }

    const data = await response.json();
    await setTokens(data.accessToken, data.refreshToken, data.expiresAt);
    return data.accessToken;
  } catch (error) {
    // Network error during refresh -- do NOT logout, just return null
    // so the user stays logged in and can retry when connectivity returns
    if (isNetworkError(error)) {
      return null;
    }
    // For other unexpected errors, also don't logout
    return null;
  }
}

function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message === 'Network request failed') {
    return true;
  }
  if (error instanceof TypeError && error.message?.includes('fetch')) {
    return true;
  }
  return false;
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { skipAuth?: boolean }
): Promise<T> {
  const { accessToken, expiresAt } = useAuthStore.getState();
  const { skipAuth, ...fetchOptions } = options || {};

  const headers: Record<string, string> = {
    ...(fetchOptions?.headers as Record<string, string>),
  };

  // Only set Content-Type for non-FormData requests
  if (!(fetchOptions?.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  // Proactively refresh if token is about to expire (within 2 minutes)
  if (!skipAuth && accessToken && expiresAt) {
    const expiresAtMs = new Date(expiresAt).getTime();
    const now = Date.now();
    if (expiresAtMs - now < 2 * 60 * 1000) {
      const newToken = await refreshTokenIfNeeded();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
      } else if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
    } else {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }
  } else if (!skipAuth && accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    let response = await fetch(`${API_BASE}${path}`, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    });

    // If 401, try refreshing the token once
    if (response.status === 401 && !skipAuth && accessToken) {
      const newToken = await refreshTokenIfNeeded();
      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
        const retryController = new AbortController();
        const retryTimeoutId = setTimeout(() => retryController.abort(), 30000);
        try {
          response = await fetch(`${API_BASE}${path}`, {
            ...fetchOptions,
            headers,
            signal: retryController.signal,
          });
        } finally {
          clearTimeout(retryTimeoutId);
        }
      }
    }

    // After refresh attempt, if still 401 then logout
    if (response.status === 401) {
      const { logout } = useAuthStore.getState();
      await logout();
      throw new AuthError();
    }

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new ApiError(response.status, data);
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError || error instanceof AuthError) {
      throw error;
    }
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new NetworkError('Request timed out. Please check your connection and try again.');
    }
    // Detect network failures (e.g. offline, DNS failure)
    if (isNetworkError(error)) {
      throw new NetworkError();
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export { API_BASE, ApiError, AuthError, NetworkError };
