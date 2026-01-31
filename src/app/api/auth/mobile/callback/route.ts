import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import {
  exchangeCodeForTokens,
  decodeIdToken,
  fetchCustomerFromAccountApi,
} from '@/lib/shopify-auth';

/**
 * POST /api/auth/mobile/callback
 *
 * Exchanges the OAuth authorization code for tokens (mobile flow).
 * Unlike the web callback which sets cookies, this returns tokens as JSON
 * for the mobile app to store in secure storage.
 */
export async function POST(request: NextRequest) {
  try {
    const { code, state, codeVerifier } = await request.json();

    if (!code || !state || !codeVerifier) {
      return NextResponse.json(
        { error: 'Missing required parameters: code, state, codeVerifier' },
        { status: 400 }
      );
    }

    // Exchange authorization code for tokens
    const tokens = await exchangeCodeForTokens(code, codeVerifier);

    // Decode the ID token to get customer info
    const customerInfo = decodeIdToken(tokens.id_token);

    // Try to get first/last name from Customer Account API
    let firstName = customerInfo.given_name || null;
    let lastName = customerInfo.family_name || null;

    if ((!firstName || !lastName) && tokens.access_token) {
      const accountInfo = await fetchCustomerFromAccountApi(tokens.access_token);
      if (accountInfo) {
        firstName = firstName || accountInfo.firstName || null;
        lastName = lastName || accountInfo.lastName || null;
      }
    }

    // Create or update the user
    const user = await prisma.user.upsert({
      where: { shopifyId: customerInfo.sub },
      update: {
        email: customerInfo.email,
        firstName,
        lastName,
      },
      create: {
        shopifyId: customerInfo.sub,
        email: customerInfo.email,
        firstName,
        lastName,
      },
    });

    // Detect platform from User-Agent
    const ua = request.headers.get('user-agent') || '';
    let platform = 'ios';
    if (ua.toLowerCase().includes('android')) {
      platform = 'android';
    }

    // Generate a refresh token
    const refreshToken = crypto.randomBytes(32).toString('hex');

    // Create a database session
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        accessToken: tokens.access_token,
        refreshToken,
        platform,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
      },
    });

    return NextResponse.json({
      accessToken: tokens.access_token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
      },
      expiresAt: session.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error('Mobile callback error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
