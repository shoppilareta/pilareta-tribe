import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';

/**
 * Maps incoming deep links (pilareta:// and https://tribe.pilareta.com)
 * to the correct Expo Router screen.
 *
 * Expo Router handles file-based routing automatically for most cases.
 * This hook handles special cases and web-to-app universal link mappings
 * where the web URL structure differs from the app file structure.
 *
 * Web URL patterns → App routes:
 *   /track                      → /(tabs)/track
 *   /track/log/:id              → /(tabs)/track/[id]
 *   /learn/exercises/:slug      → /(tabs)/learn/exercises/[slug]
 *   /learn/programs/:slug       → /(tabs)/learn/programs/[slug]
 *   /community                  → /(tabs)/community
 *   /community/post/:id         → /(tabs)/community/[id]
 *   /studios                    → /(tabs)/studios
 *   /studios/:id                → /(tabs)/studios/[id]
 *   /shop                       → /(tabs)/shop
 */
export function useDeepLinks() {
  useEffect(() => {
    // Handle the URL that launched the app (cold start)
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    // Handle URLs when app is already running (warm start)
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => subscription.remove();
  }, []);
}

function handleDeepLink(url: string) {
  try {
    const parsed = Linking.parse(url);
    const path = parsed.path || '';

    // Auth callback is handled by the auth flow — skip here
    if (path.startsWith('auth/')) return;

    // Map web paths to app routes
    const route = mapWebPathToAppRoute(path, parsed.queryParams || {});
    if (route) {
      // Small delay to ensure navigation is ready
      setTimeout(() => {
        router.push(route as never);
      }, 100);
    }
  } catch {
    // Invalid URL — ignore
  }
}

function mapWebPathToAppRoute(
  path: string,
  params: Record<string, string | undefined>,
): string | { pathname: string; params: Record<string, string> } | null {
  // Remove leading slash
  const cleanPath = path.replace(/^\//, '');

  // Track
  if (cleanPath === 'track') return '/(tabs)/track';
  const logMatch = cleanPath.match(/^track\/log\/(.+)$/);
  if (logMatch) return { pathname: '/(tabs)/track/[id]', params: { id: logMatch[1] } };

  // Learn
  if (cleanPath === 'learn') return '/(tabs)/learn';
  const exerciseMatch = cleanPath.match(/^learn\/exercises\/(.+)$/);
  if (exerciseMatch) return { pathname: '/(tabs)/learn/exercises/[slug]', params: { slug: exerciseMatch[1] } };
  const programMatch = cleanPath.match(/^learn\/programs\/(.+)$/);
  if (programMatch) return { pathname: '/(tabs)/learn/programs/[slug]', params: { slug: programMatch[1] } };

  // Community
  if (cleanPath === 'community') return '/(tabs)/community';
  const postMatch = cleanPath.match(/^community\/post\/(.+)$/);
  if (postMatch) return { pathname: '/(tabs)/community/[id]', params: { id: postMatch[1] } };

  // Studios
  if (cleanPath === 'studios') return '/(tabs)/studios';
  const studioMatch = cleanPath.match(/^studios\/(.+)$/);
  if (studioMatch) return { pathname: '/(tabs)/studios/[id]', params: { id: studioMatch[1] } };

  // Shop
  if (cleanPath === 'shop') return '/(tabs)/shop';

  return null;
}
