/**
 * API Version Checking
 *
 * Validates mobile app version against a server-side minimum.
 * The minimum version is stored in SystemConfig and can be updated
 * by admins without a deploy.
 *
 * Returns a 426 Upgrade Required response when the client version
 * is below the minimum, with a JSON body the mobile app can parse.
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';

const VERSION_HEADER = 'x-app-version';
const PLATFORM_HEADER = 'x-app-platform';

// Cache the minimum version for 5 minutes to avoid DB lookups on every request
let cachedMinVersion: string | null = null;
let cachedAt = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Compare two semver version strings.
 * Returns: -1 if a < b, 0 if a == b, 1 if a > b
 */
export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  const len = Math.max(pa.length, pb.length);

  for (let i = 0; i < len; i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

/**
 * Get the minimum required app version from SystemConfig.
 * Returns null if no minimum is set (all versions allowed).
 */
async function getMinimumVersion(): Promise<string | null> {
  const now = Date.now();
  if (cachedMinVersion !== null && now - cachedAt < CACHE_TTL) {
    return cachedMinVersion;
  }

  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: 'min_app_version' },
    });
    cachedMinVersion = config?.value || null;
    cachedAt = now;
    return cachedMinVersion;
  } catch {
    // On DB error, allow all versions (fail open)
    return cachedMinVersion;
  }
}

/**
 * Reset the cached minimum version (call after admin updates it).
 */
export function resetVersionCache(): void {
  cachedMinVersion = null;
  cachedAt = 0;
}

/**
 * Check if a mobile request meets the minimum version requirement.
 *
 * Returns a 426 Response if the client is too old, or null if OK.
 * Skips the check for web requests (no version header).
 *
 * Usage in API routes:
 *   const versionError = await checkAppVersion(request);
 *   if (versionError) return versionError;
 */
export async function checkAppVersion(request: NextRequest): Promise<Response | null> {
  const clientVersion = request.headers.get(VERSION_HEADER);

  // No version header = web client or old mobile client without header.
  // For backward compatibility, allow requests without the header.
  // Once all mobile clients have the header, this can be tightened.
  if (!clientVersion) return null;

  const minVersion = await getMinimumVersion();
  if (!minVersion) return null; // No minimum configured

  if (compareVersions(clientVersion, minVersion) < 0) {
    return Response.json(
      {
        error: 'App update required',
        code: 'UPDATE_REQUIRED',
        minVersion,
        currentVersion: clientVersion,
        message: 'Please update the Pilareta Tribe app to continue.',
      },
      { status: 426 }
    );
  }

  return null;
}
