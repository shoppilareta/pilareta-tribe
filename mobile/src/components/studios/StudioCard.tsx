import { memo, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import Constants from 'expo-constants';
import { Card } from '@/components/ui';
import { colors, typography, spacing, radius } from '@/theme';
import type { Studio } from '@shared/types';

/**
 * Determine if a studio is currently open based on Google Places openingHours data.
 * Returns true (open), false (closed), or null (unknown/no data).
 */
function isStudioOpenNow(openingHours: unknown): boolean | null {
  if (!openingHours || typeof openingHours !== 'object') return null;
  const hours = openingHours as {
    open_now?: boolean;
    periods?: { open?: { day: number; time: string }; close?: { day: number; time: string } }[];
  };

  // Some responses include a simple open_now boolean without periods
  if (!Array.isArray(hours.periods) || hours.periods.length === 0) {
    if (typeof hours.open_now === 'boolean') return hours.open_now;
    return null;
  }

  const now = new Date();
  // Google Places uses Sunday=0, same as JS getDay()
  const currentDay = now.getDay();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

  // Check if any period covers the current day+time
  for (const period of hours.periods) {
    if (!period.open) continue;

    // 24-hour place: single period with open day 0, time 0000, no close
    // OR multiple 24-hour indicators
    if (period.open.day === 0 && period.open.time === '0000' && !period.close) {
      return true;
    }

    const openDay = period.open.day;
    const openTime = period.open.time;
    const closeDay = period.close?.day ?? openDay;
    const closeTime = period.close?.time ?? '2359';

    if (openDay === closeDay) {
      // Same-day period
      if (currentDay === openDay && currentTime >= openTime && currentTime < closeTime) {
        return true;
      }
    } else {
      // Overnight period (e.g., opens Saturday, closes Sunday)
      // Need to handle multi-day spans properly
      const daySpan = (closeDay - openDay + 7) % 7;
      const currentDayFromOpen = (currentDay - openDay + 7) % 7;
      if (currentDayFromOpen < daySpan) {
        return true;
      } else if (currentDayFromOpen === 0 && currentTime >= openTime) {
        return true;
      } else if (currentDayFromOpen === daySpan && currentTime < closeTime) {
        return true;
      }
    }
  }

  return false;
}

const GOOGLE_MAPS_KEY = Constants.expoConfig?.ios?.config?.googleMapsApiKey
  ?? (Constants.expoConfig?.android?.config?.googleMaps as { apiKey?: string })?.apiKey
  ?? '';

function getStudioPhotoUrl(studio: Studio): string | null {
  if (!studio.photos || !Array.isArray(studio.photos) || studio.photos.length === 0) return null;
  const first = studio.photos[0];
  if (!first || typeof first !== 'object') return null;
  const p = first as { reference?: string; photo_reference?: string; url?: string };
  // If the photo already has a full URL, use it directly
  if (typeof p.url === 'string' && p.url.length > 0) return p.url;
  // DB stores as "reference", Google API returns "photo_reference" — handle both
  const ref = p?.reference || p?.photo_reference;
  if (!ref || !GOOGLE_MAPS_KEY) return null;
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=120&photo_reference=${encodeURIComponent(ref)}&key=${GOOGLE_MAPS_KEY}`;
}

export { isStudioOpenNow };

interface StudioCardProps {
  studio: Studio;
  distance?: number;
  /** User's current location; if provided, distance is computed from here to studio */
  userLocation?: { lat: number; lng: number } | null;
  isFavorited?: boolean;
  onToggleFavorite?: (studioId: string) => void;
}

/** Haversine distance in meters between two lat/lng pairs */
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(meters: number): string {
  if (meters < 100) return `${Math.round(meters)} m`;
  // Always show as km once >= 100m for consistency ("0.1 km", "0.5 km", "2.3 km")
  const km = meters / 1000;
  return `${km < 10 ? km.toFixed(1) : Math.round(km)} km`;
}

/**
 * Render star rating as visual stars: "★★★★☆" style.
 * Returns an array of { filled, half } for 5 stars.
 */
function renderStarRating(rating: number): string {
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.25 && rating - fullStars < 0.75;
  const ceilStars = halfStar ? fullStars + 1 : Math.round(rating);
  let stars = '';
  for (let i = 0; i < 5; i++) {
    stars += i < ceilStars ? '\u2605' : '\u2606';
  }
  return stars;
}

export const StudioCard = memo(function StudioCard({ studio, distance, userLocation, isFavorited, onToggleFavorite }: StudioCardProps) {
  const photoUrl = getStudioPhotoUrl(studio);
  const openNow = useMemo(() => isStudioOpenNow(studio.openingHours), [studio.openingHours]);

  // Compute distance from user if not explicitly provided
  const computedDistance = useMemo(() => {
    if (distance != null) return distance;
    if (userLocation && studio.latitude != null && studio.longitude != null) {
      return haversineDistance(userLocation.lat, userLocation.lng, studio.latitude, studio.longitude);
    }
    return null;
  }, [distance, userLocation, studio.latitude, studio.longitude]);

  const displayAddress = studio.formattedAddress || studio.address || studio.city || 'Location not available';
  const amenities = studio.amenities ?? [];

  return (
    <Pressable onPress={() => router.push(`/(tabs)/studios/${studio.id}`)}>
      <Card padding="md" style={styles.card}>
        {photoUrl && (
          <Image source={{ uri: photoUrl }} style={styles.studioPhoto} />
        )}
        <View style={styles.cardContent}>
        <View style={styles.topRow}>
          <View style={styles.nameContainer}>
            <Text style={styles.name} numberOfLines={1}>{studio.name}</Text>
            {onToggleFavorite && (
              <Pressable
                style={styles.heartButton}
                onPress={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(studio.id);
                }}
                hitSlop={6}
              >
                <Svg width={16} height={16} viewBox="0 0 24 24" fill={isFavorited ? colors.error : 'none'} stroke={isFavorited ? colors.error : colors.fg.muted} strokeWidth={2}>
                  <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </Svg>
              </Pressable>
            )}
            {studio.verified && (
              <View style={styles.verifiedBadge}>
                <Svg width={12} height={12} viewBox="0 0 24 24" fill="rgba(34, 197, 94, 0.8)" stroke="none">
                  <Path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </Svg>
              </View>
            )}
            {openNow !== null && (
              <View style={[styles.openBadge, openNow ? styles.openBadgeOpen : styles.openBadgeClosed]}>
                <Text style={[styles.openBadgeText, openNow ? styles.openTextOpen : styles.openTextClosed]}>
                  {openNow ? 'Open' : 'Closed'}
                </Text>
              </View>
            )}
          </View>
          {computedDistance != null && (
            <Text style={styles.distance}>{formatDistance(computedDistance)}</Text>
          )}
        </View>

        <View style={styles.infoRow}>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.fg.tertiary} strokeWidth={1.5}>
            <Path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text style={styles.address} numberOfLines={1}>
            {displayAddress}
          </Text>
        </View>

        {/* Rating row: visual stars or "No rating yet" */}
        <View style={styles.metaRow}>
          {studio.rating != null ? (
            <View style={styles.ratingContainer}>
              <Text style={styles.starText}>{renderStarRating(studio.rating)}</Text>
              <Text style={styles.rating}>{studio.rating.toFixed(1)}</Text>
              {studio.ratingCount != null && (
                <Text style={styles.ratingCount}>({studio.ratingCount})</Text>
              )}
            </View>
          ) : (
            <Text style={styles.noRating}>No rating yet</Text>
          )}
          {studio.phoneNumber && (
            <Text style={styles.phone} numberOfLines={1}>{studio.phoneNumber}</Text>
          )}
        </View>

        {amenities.length > 0 && (
          <View style={styles.amenitiesRow}>
            {amenities.slice(0, 3).map((a) => (
              <View key={a} style={styles.amenityChip}>
                <Text style={styles.amenityText}>{a}</Text>
              </View>
            ))}
            {amenities.length > 3 && (
              <Text style={styles.moreText}>+{amenities.length - 3}</Text>
            )}
          </View>
        )}
        </View>
      </Card>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: { marginBottom: spacing.sm, flexDirection: 'row' },
  studioPhoto: { width: 56, height: 56, borderRadius: radius.sm, marginRight: spacing.sm, backgroundColor: 'rgba(246,237,221,0.05)' },
  cardContent: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  nameContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flex: 1 },
  name: { fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: colors.fg.primary, flex: 1 },
  verifiedBadge: { marginLeft: 2 },
  distance: { fontSize: typography.sizes.sm, color: colors.fg.tertiary, marginLeft: spacing.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  address: { fontSize: typography.sizes.sm, color: colors.fg.secondary, flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xs },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  starText: { fontSize: 12, color: 'rgba(234, 179, 8, 0.9)', letterSpacing: 1 },
  rating: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.fg.primary },
  ratingCount: { fontSize: 11, color: colors.fg.tertiary },
  noRating: { fontSize: 11, color: colors.fg.muted, fontStyle: 'italic' },
  phone: { fontSize: typography.sizes.sm, color: colors.fg.tertiary },
  amenitiesRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
  amenityChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.xs, backgroundColor: colors.cream05 },
  amenityText: { fontSize: 11, color: colors.fg.tertiary, textTransform: 'capitalize' },
  moreText: { fontSize: 11, color: colors.fg.muted },
  heartButton: { padding: 4, marginLeft: 4 },
  openBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: radius.xs, marginLeft: 4 },
  openBadgeOpen: { backgroundColor: 'rgba(34, 197, 94, 0.15)' },
  openBadgeClosed: { backgroundColor: 'rgba(239, 68, 68, 0.15)' },
  openBadgeText: { fontSize: 10, fontWeight: typography.weights.semibold },
  openTextOpen: { color: colors.success },
  openTextClosed: { color: colors.error },
});
