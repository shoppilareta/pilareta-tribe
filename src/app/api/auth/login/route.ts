import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import {
  generateCodeVerifier,
  generateState,
  buildAuthorizationUrl,
  isNewAccountsMode,
} from '@/lib/shopify-auth';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request: Request) {
  try {
    const limiter = await rateLimit(request, { limit: 10, window: 60 });
    if (!limiter.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    if (!isNewAccountsMode()) {
      // For classic mode, redirect to a login page with form
      return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL));
    }

    // Get redirect URL from query params
    const url = new URL(request.url);
    const redirectTo = url.searchParams.get('redirect') || '/account';

    // Generate PKCE parameters
    const codeVerifier = generateCodeVerifier();
    const state = generateState();

    // Store in session for callback verification
    const session = await getSession();
    session.codeVerifier = codeVerifier;
    session.state = state;
    session.redirectTo = redirectTo;
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
