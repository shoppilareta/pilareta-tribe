import { randomBytes, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const CSRF_COOKIE_NAME = 'pilareta-csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const TOKEN_LENGTH = 32;

/**
 * Generate a random CSRF token, set it as a cookie (HttpOnly: false so
 * client-side JS can read it), and return the token value.
 */
export async function generateCsrfToken(): Promise<string> {
  const token = randomBytes(TOKEN_LENGTH).toString('hex');

  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // JS must be able to read this
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return token;
}

/**
 * Validate the CSRF double-submit token.
 *
 * - Skips validation when the request carries a Bearer token (mobile app auth
 *   is not vulnerable to CSRF).
 * - Compares the `x-csrf-token` header to the `pilareta-csrf-token` cookie
 *   using a timing-safe comparison.
 *
 * Returns `true` if the request is allowed to proceed.
 */
export function validateCsrf(request: NextRequest): boolean {
  // Skip CSRF check for Bearer-token (mobile) requests
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return true;
  }

  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;

  if (!headerToken || !cookieToken) {
    return false;
  }

  // Both values must be the same length for timingSafeEqual
  if (headerToken.length !== cookieToken.length) {
    return false;
  }

  try {
    return timingSafeEqual(
      Buffer.from(headerToken, 'utf-8'),
      Buffer.from(cookieToken, 'utf-8'),
    );
  } catch {
    return false;
  }
}
