import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/db';
import {
  exchangeCodeForTokens,
  verifyAndDecodeIdToken,
  fetchCustomerFromAccountApi,
} from '@/lib/shopify-auth';
import { logger } from '@/lib/logger';

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

    // Verify and decode the ID token to get customer info
    const customerInfo = await verifyAndDecodeIdToken(tokens.id_token);

    // Ensure shopifyId is a string (Shopify JWT sub claim may be a number)
    const shopifyId = String(customerInfo.sub);

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
      where: { shopifyId },
      update: {
        email: customerInfo.email,
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
      },
      create: {
        shopifyId,
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
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year (ignore Shopify's short expires_in)
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
    logger.error('auth/mobile/callback', 'Mobile callback failed', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
