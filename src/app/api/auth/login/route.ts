import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import {
  generateCodeVerifier,
  generateState,
  buildAuthorizationUrl,
  isNewAccountsMode,
} from '@/lib/shopify-auth';

export async function GET() {
  try {
    if (!isNewAccountsMode()) {
      // For classic mode, redirect to a login page with form
      return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL));
    }

    // Generate PKCE parameters
    const codeVerifier = generateCodeVerifier();
    const state = generateState();

    // Store in session for callback verification
    const session = await getSession();
    session.codeVerifier = codeVerifier;
    session.state = state;
    await session.save();

    // Build authorization URL and redirect
    const authUrl = await buildAuthorizationUrl(codeVerifier, state);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate login' },
      { status: 500 }
    );
  }
}
