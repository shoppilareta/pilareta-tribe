import { NextResponse } from 'next/server';
import {
  generateCodeVerifier,
  generateState,
  buildAuthorizationUrl,
} from '@/lib/shopify-auth';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tribe.pilareta.com';

/**
 * POST /api/auth/mobile/login
 *
 * Initiates the Shopify OAuth PKCE flow for mobile apps.
 * Returns the auth URL and PKCE parameters as JSON
 * (instead of redirecting like the web flow).
 *
 * The mobile app:
 * 1. Calls this endpoint
 * 2. Stores codeVerifier in memory
 * 3. Opens authUrl in system browser via expo-web-browser
 * 4. After user authenticates, Shopify redirects to the mobile deep link
 * 5. Mobile app sends code + codeVerifier to /api/auth/mobile/callback
 */
export async function POST() {
  try {
    const codeVerifier = generateCodeVerifier();
    const state = generateState();

    // Build the Shopify authorization URL
    // Note: redirect_uri for mobile will be handled differently -
    // the mobile app will intercept the redirect via deep link
    const authUrl = await buildAuthorizationUrl(codeVerifier, state);

    return NextResponse.json({
      authUrl,
      state,
      codeVerifier,
    });
  } catch (error) {
    console.error('Mobile login error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate login' },
      { status: 500 }
    );
  }
}
