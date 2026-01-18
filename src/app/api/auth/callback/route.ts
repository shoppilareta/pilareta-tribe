import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { exchangeCodeForTokens, decodeIdToken } from '@/lib/shopify-auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tribe.pilareta.com';

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription);
    return NextResponse.redirect(
      `${appUrl}/?error=${encodeURIComponent(errorDescription || error)}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}/?error=Missing+code+or+state`);
  }

  try {
    // Get session and validate state
    const session = await getSession();

    if (session.state !== state) {
      console.error('State mismatch:', { expected: session.state, received: state });
      return NextResponse.redirect(`${appUrl}/?error=Invalid+state`);
    }

    const codeVerifier = session.codeVerifier;
    if (!codeVerifier) {
      return NextResponse.redirect(`${appUrl}/?error=Missing+code+verifier`);
    }

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code, codeVerifier);

    // Decode ID token to get customer info
    const customerInfo = decodeIdToken(tokens.id_token);

    // Ensure shopifyId is a string (Shopify may return it as a number)
    const shopifyId = String(customerInfo.sub);

    // Create or update user in database
    const user = await prisma.user.upsert({
      where: { shopifyId },
      update: {
        email: customerInfo.email,
        updatedAt: new Date(),
      },
      create: {
        shopifyId,
        email: customerInfo.email,
      },
    });

    // Create session record
    await prisma.session.create({
      data: {
        userId: user.id,
        accessToken: tokens.access_token,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      },
    });

    // Update session cookie
    session.userId = user.id;
    session.shopifyAccessToken = tokens.access_token;
    session.shopifyCustomerId = shopifyId;
    session.email = customerInfo.email;
    // Clear PKCE params
    session.codeVerifier = undefined;
    session.state = undefined;
    await session.save();

    // Redirect to account page
    return NextResponse.redirect(`${appUrl}/account`);
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(
      `${appUrl}/?error=${encodeURIComponent('Authentication failed')}`
    );
  }
}
