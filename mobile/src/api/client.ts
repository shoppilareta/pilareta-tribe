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

async function refreshTokenIfNeeded(): Promise<string | null> {
  const { refreshToken, setTokens, logout } = useAuthStore.getState();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_BASE}/api/auth/mobile/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      await logout();
      return null;
    }

    const data = await response.json();
    await setTokens(data.accessToken, data.refreshToken, data.expiresAt);
    return data.accessToken;
  } catch {
    await logout();
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { skipAuth?: boolean }
): Promise<T> {
  const { accessToken } = useAuthStore.getState();
  const { skipAuth, ...fetchOptions } = options || {};

  const headers: Record<string, string> = {
    ...(fetchOptions?.headers as Record<string, string>),
  };

  // Only set Content-Type for non-FormData requests
  if (!(fetchOptions?.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  if (!skipAuth && accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  let response = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers,
  });

  // If 401, try refreshing the token once
  if (response.status === 401 && !skipAuth && accessToken) {
    const newToken = await refreshTokenIfNeeded();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(`${API_BASE}${path}`, {
        ...fetchOptions,
        headers,
      });
    }
  }

  if (response.status === 401) {
    throw new AuthError();
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(response.status, data);
  }

  return response.json();
}

export { API_BASE, ApiError, AuthError };
