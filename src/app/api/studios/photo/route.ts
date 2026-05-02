import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

/**
 * GET /api/studios/photo?ref=<photo_reference>&w=<maxwidth>
 *
 * Proxies a Google Places photo. The mobile app's Google Maps API key
 * may be restricted to package names that don't match server-side photo
 * requests, so we proxy through our backend (which uses an unrestricted
 * server key) instead of embedding the key in image URLs.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const ref = url.searchParams.get('ref');
  const maxWidthParam = url.searchParams.get('w');

  if (!ref) {
    return NextResponse.json({ error: 'Missing ref parameter' }, { status: 400 });
  }

  // Only allow alphanumeric, dash, underscore in the reference (Google's format)
  if (!/^[A-Za-z0-9_-]+$/.test(ref)) {
    return NextResponse.json({ error: 'Invalid ref' }, { status: 400 });
  }

  const maxWidth = Math.min(Math.max(parseInt(maxWidthParam || '600', 10) || 600, 100), 1600);

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const googleUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${encodeURIComponent(ref)}&key=${apiKey}`;

  try {
    // Google's place/photo endpoint redirects to the actual image; follow redirects
    const upstream = await fetch(googleUrl, { redirect: 'follow' });

    if (!upstream.ok) {
      logger.warn('studios/photo', `Google Places photo returned ${upstream.status}`);
      return NextResponse.json({ error: 'Photo unavailable' }, { status: upstream.status });
    }

    const contentType = upstream.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await upstream.arrayBuffer());

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(buffer.length),
        // Cache for 1 day at the CDN/browser; Google permits this
        'Cache-Control': 'public, max-age=86400, immutable',
      },
    });
  } catch (error) {
    logger.error('studios/photo', 'Failed to proxy Google Places photo', error);
    return NextResponse.json({ error: 'Failed to fetch photo' }, { status: 500 });
  }
}
