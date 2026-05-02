import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, Pressable, ActivityIndicator, Linking, Platform, TextInput, Alert, Image, Dimensions, Share as RNShare } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';
import { Card, Button } from '@/components/ui';
import { ImageZoomModal } from '@/components/ui/ImageZoomModal';
import { StudioCard } from '@/components/studios';
import { getStudio, getNearbyStudios } from '@/api/studios';
import { getFeed } from '@/api/community';
import { useStudioFavorites } from '@/hooks/useStudioFavorites';
import { useAuthStore } from '@/stores/authStore';
import { apiFetch, API_BASE } from '@/api/client';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PHOTO_HEIGHT = 200;

type DetailTab = 'info' | 'claim' | 'suggest';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Returns open/closed status with the relevant time boundary, or null if hours unavailable. */
function getOpenClosedStatus(openingHours: unknown): { isOpen: boolean; timeLabel: string } | null {
  if (!openingHours || typeof openingHours !== 'object') return null;
  const oh = openingHours as {
    open_now?: boolean;
    periods?: { open?: { day: number; time: string }; close?: { day: number; time: string } }[];
  };
  if (!Array.isArray(oh.periods) || oh.periods.length === 0) {
    // Fallback: some responses only have open_now without periods
    if (typeof oh.open_now === 'boolean') {
      return { isOpen: oh.open_now, timeLabel: oh.open_now ? 'Currently open' : 'Currently closed' };
    }
    return null;
  }

  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

  const fmtTime = (t: string) => {
    const h = parseInt(t.slice(0, 2), 10);
    const m = t.slice(2);
    if (isNaN(h)) return t;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${m} ${ampm}`;
  };

  // 24-hour place: single period with open day 0, time 0000, no close
  // Also handle cases where every period has no close (all day, every day)
  const allNoClose = oh.periods.every((p) => p.open && !p.close);
  if (allNoClose && oh.periods[0]?.open?.time === '0000') {
    return { isOpen: true, timeLabel: 'Open 24 hours' };
  }

  // Check if currently open and find close time
  for (const period of oh.periods) {
    if (!period.open) continue;
    const openDay = period.open.day;
    const openTime = period.open.time;
    const closeDay = period.close?.day ?? openDay;
    const closeTime = period.close?.time ?? '2359';

    if (openDay === closeDay) {
      if (currentDay === openDay && currentTime >= openTime && currentTime < closeTime) {
        return { isOpen: true, timeLabel: `Closes at ${fmtTime(closeTime)}` };
      }
    } else {
      if (
        (currentDay === openDay && currentTime >= openTime) ||
        (currentDay === closeDay && currentTime < closeTime)
      ) {
        return { isOpen: true, timeLabel: `Closes at ${fmtTime(closeTime)}` };
      }
    }
  }

  // Currently closed - find next open time
  // Build a list of all opening times with their "minutes from now" offset
  const periodsWithOffset = oh.periods
    .filter((p) => p.open)
    .map((p) => {
      const openDay = p.open!.day;
      const openTime = p.open!.time;
      // Calculate how many minutes from now until this period opens
      let dayDiff = (openDay - currentDay + 7) % 7;
      // If same day but time has already passed, it's next week
      if (dayDiff === 0 && openTime <= currentTime) dayDiff = 7;
      const openHour = parseInt(openTime.slice(0, 2), 10);
      const openMin = parseInt(openTime.slice(2), 10);
      const nowHour = now.getHours();
      const nowMin = now.getMinutes();
      const minutesFromNow = dayDiff * 24 * 60 + (openHour * 60 + openMin) - (nowHour * 60 + nowMin);
      return { period: p, dayDiff, minutesFromNow, openDay, openTime };
    })
    .sort((a, b) => a.minutesFromNow - b.minutesFromNow);

  if (periodsWithOffset.length > 0) {
    const next = periodsWithOffset[0];
    if (next.dayDiff === 0) {
      // Opens later today
      return { isOpen: false, timeLabel: `Opens at ${fmtTime(next.openTime)}` };
    }
    if (next.dayDiff === 1) {
      return { isOpen: false, timeLabel: `Opens tomorrow at ${fmtTime(next.openTime)}` };
    }
    const dayName = DAY_NAMES[next.openDay] ?? `Day ${next.openDay}`;
    return { isOpen: false, timeLabel: `Opens ${dayName} at ${fmtTime(next.openTime)}` };
  }

  return null;
}

const AMENITY_LABELS: Record<string, string> = {
  'reformer': 'Reformer',
  'mat': 'Mat',
  'showers': 'Showers',
  'parking': 'Parking',
  'wifi': 'WiFi',
  'ac': 'AC',
  'lockers': 'Lockers',
  'changing_rooms': 'Changing Rooms',
  'changing rooms': 'Changing Rooms',
  'towels': 'Towels',
};

function getAmenityLabel(amenity: string): string {
  const lower = amenity.toLowerCase();
  return AMENITY_LABELS[lower] ?? amenity;
}

function formatOpeningHours(openingHours: unknown): string[] {
  try {
    if (!openingHours) return [];
    // Handle case where openingHours is a simple string like "Open 24 hours"
    if (typeof openingHours === 'string') return [openingHours];
    if (typeof openingHours !== 'object') return [];

    const oh = openingHours as Record<string, unknown>;

    // Google Places format: { weekday_text: string[] }
    if (Array.isArray(oh.weekday_text) && oh.weekday_text.length > 0) {
      return oh.weekday_text.filter((t): t is string => typeof t === 'string').map(String);
    }

    // Google Places format: { periods: Array<{ open: { day, time }, close: { day, time } }> }
    if (Array.isArray(oh.periods) && oh.periods.length > 0) {
      // Handle "Open 24 hours" — single period with open day 0, time 0000, no close
      if (
        oh.periods.length === 1 &&
        (oh.periods[0] as Record<string, any>)?.open?.day === 0 &&
        (oh.periods[0] as Record<string, any>)?.open?.time === '0000' &&
        !(oh.periods[0] as Record<string, any>)?.close
      ) {
        return ['Open 24 hours'];
      }

      const dayHours: Record<number, string> = {};
      for (const period of oh.periods) {
        if (!period || typeof period !== 'object') continue;
        const p = period as Record<string, any>;
        const openDay = p.open?.day;
        const openTime = p.open?.time;
        const closeTime = p.close?.time;

        if (openDay == null || typeof openDay !== 'number' || !openTime || typeof openTime !== 'string') continue;

        const fmtTime = (t: string) => {
          const h = parseInt(t.slice(0, 2), 10);
          const m = t.slice(2);
          if (isNaN(h)) return t;
          const ampm = h >= 12 ? 'PM' : 'AM';
          const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
          return `${h12}:${m} ${ampm}`;
        };

        const dayName = DAY_NAMES[openDay] || `Day ${openDay}`;
        const timeStr = closeTime && typeof closeTime === 'string'
          ? `${fmtTime(openTime)} - ${fmtTime(closeTime)}`
          : `${fmtTime(openTime)} - Open`;
        dayHours[openDay] = dayHours[openDay] ? `${dayHours[openDay]}, ${timeStr}` : timeStr;
      }

      return DAY_NAMES.map((name, i) => `${name}: ${dayHours[i] || 'Closed'}`);
    }

    // Simple object format: { Monday: "9:00 - 17:00", ... }
    if (!Array.isArray(oh)) {
      const entries = Object.entries(oh).filter(([k]) => k !== 'open_now' && k !== 'periods' && k !== 'weekday_text');
      if (entries.length > 0) {
        return entries.map(([day, hours]) => `${day}: ${typeof hours === 'string' ? hours : 'See website'}`);
      }
    }

    // Array of strings
    if (Array.isArray(openingHours)) {
      return openingHours.filter(item => typeof item === 'string').map(String);
    }

    return [];
  } catch {
    return ['Hours not available'];
  }
}

function photoRefToUrl(ref: string, maxWidth = 600): string | null {
  if (!ref) return null;
  // Proxy through our backend so the API key isn't exposed and isn't
  // restricted to the mobile app's bundle id.
  return `${API_BASE}/api/studios/photo?ref=${encodeURIComponent(ref)}&w=${maxWidth}`;
}

function extractPhotoUrl(item: unknown, maxWidth = 600): string | null {
  if (typeof item === 'string' && item.length > 0) return item;
  if (!item || typeof item !== 'object') return null;
  const p = item as Record<string, unknown>;
  if (typeof p.url === 'string' && p.url.length > 0) return p.url;
  // DB stores as "reference", Google API returns "photo_reference" -- handle both
  const ref = (typeof p.reference === 'string' ? p.reference : null)
    || (typeof p.photo_reference === 'string' ? p.photo_reference : null);
  if (ref) return photoRefToUrl(ref, maxWidth);
  return null;
}

function getPhotoUrl(photos: unknown): string | null {
  if (!Array.isArray(photos) || photos.length === 0) return null;
  return extractPhotoUrl(photos[0]);
}

function getPhotoUrls(photos: unknown, maxCount = 5): string[] {
  if (!Array.isArray(photos) || photos.length === 0) return [];
  const urls: string[] = [];
  for (const item of photos.slice(0, maxCount)) {
    const url = extractPhotoUrl(item);
    if (url) urls.push(url);
  }
  return urls;
}

/** Render star rating as visual stars */
function renderStarRating(rating: number): string {
  const ceilStars = Math.round(rating);
  let stars = '';
  for (let i = 0; i < 5; i++) {
    stars += i < ceilStars ? '\u2605' : '\u2606';
  }
  return stars;
}

export default function StudioDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<DetailTab>('info');
  const isAuthenticated = !!useAuthStore((s) => s.accessToken);
  const { isFavorited, toggleFavorite } = useStudioFavorites();
  const favorited = id ? isFavorited(id) : false;

  const handleToggleFavorite = () => {
    if (!id) return;
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(id);
  };

  const handleShare = async () => {
    if (!data?.studio) return;
    const s = data.studio;
    const address = s.formattedAddress || s.address || '';
    let message = `Check out ${s.name}`;
    if (address) message += ` at ${address}`;
    if (s.rating != null) message += ` - Rated ${s.rating.toFixed(1)}/5`;
    // Include a maps link if coordinates are available, otherwise use address
    if (s.latitude != null && s.longitude != null) {
      message += `\nhttps://maps.google.com/?q=${s.latitude},${s.longitude}`;
    } else if (address) {
      message += `\nhttps://maps.google.com/?q=${encodeURIComponent(address)}`;
    }
    try {
      await RNShare.share({ message });
    } catch {
      // User cancelled or share failed - no action needed
    }
  };

  const { data, isLoading } = useQuery({
    queryKey: ['studio-detail', id],
    queryFn: () => getStudio(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}><ActivityIndicator color={colors.fg.primary} /></View>
      </SafeAreaView>
    );
  }

  const studio = data?.studio;
  if (!studio) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>Studio not found</Text>
          <Pressable onPress={() => router.back()}><Text style={styles.link}>Go back</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const photoUrl = getPhotoUrl(studio.photos);
  const photoUrls = getPhotoUrls(studio.photos, 5);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>{studio.name}</Text>
        <View style={styles.headerActions}>
          <Pressable onPress={handleShare} style={styles.headerIconButton} hitSlop={8}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
              <Path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <Pressable onPress={handleToggleFavorite} style={styles.headerIconButton} hitSlop={8}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill={favorited ? colors.error : 'none'} stroke={favorited ? colors.error : colors.fg.primary} strokeWidth={2}>
              <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </Svg>
          </Pressable>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {(['info', 'claim', 'suggest'] as DetailTab[]).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'info' ? 'Details' : tab === 'claim' ? 'Claim' : 'Suggest Edit'}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'info' && <StudioInfo studio={studio} photoUrl={photoUrl} photoUrls={photoUrls} />}
        {activeTab === 'claim' && <ClaimForm studioId={studio.id} />}
        {activeTab === 'suggest' && <SuggestEditForm studioId={studio.id} />}

        {/* Community Posts from this studio */}
        {activeTab === 'info' && (
          <CommunityPostsSection studioId={studio.id} />
        )}

        {/* Nearby Studios */}
        {activeTab === 'info' && studio.latitude != null && studio.longitude != null && (
          <NearbyStudiosCarousel studioId={studio.id} lat={studio.latitude} lng={studio.longitude} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StudioInfo({ studio, photoUrl, photoUrls }: { studio: NonNullable<Awaited<ReturnType<typeof getStudio>>['studio']>; photoUrl: string | null; photoUrls: string[] }) {
  const hours = formatOpeningHours(studio.openingHours);
  const openClosedStatus = useMemo(() => getOpenClosedStatus(studio.openingHours), [studio.openingHours]);
  const [zoomVisible, setZoomVisible] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);

  const handleDirections = () => {
    if (!studio) return;
    const { latitude, longitude, name } = studio;
    if (latitude != null && longitude != null) {
      const url = Platform.select({
        ios: `maps://app?daddr=${latitude},${longitude}&q=${encodeURIComponent(name)}`,
        android: `google.navigation:q=${latitude},${longitude}`,
        default: `https://maps.google.com/maps?daddr=${latitude},${longitude}`,
      });
      if (url) Linking.openURL(url).catch(() => {
        // Fallback if the native maps app is not installed
        Linking.openURL(`https://maps.google.com/maps?daddr=${latitude},${longitude}`);
      });
    } else {
      // Fallback to address search when no coordinates are available
      const searchStr = studio.formattedAddress || studio.address || `${name} ${studio.city || ''}`.trim();
      const addr = encodeURIComponent(searchStr);
      Linking.openURL(`https://maps.google.com/?q=${addr}`);
    }
  };

  return (
    <>
      {/* Open/Closed Banner */}
      {openClosedStatus && (
        <View style={[styles.openClosedBanner, openClosedStatus.isOpen ? styles.openBanner : styles.closedBanner]}>
          <View style={[styles.openClosedDot, openClosedStatus.isOpen ? styles.openDot : styles.closedDot]} />
          <Text style={[styles.openClosedText, openClosedStatus.isOpen ? styles.openText : styles.closedText]}>
            {openClosedStatus.isOpen ? 'Open' : 'Closed'}
            {'  ·  '}
            {openClosedStatus.timeLabel}
          </Text>
        </View>
      )}

      {/* Photo Gallery */}
      {photoUrls.length > 1 ? (
        <View style={styles.galleryContainer}>
          <FlatList
            data={photoUrls}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item, index }) => (
              <Pressable onPress={() => { setZoomIndex(index); setZoomVisible(true); }}>
                <Image source={{ uri: item }} style={styles.galleryPhoto} resizeMode="cover" />
              </Pressable>
            )}
            ItemSeparatorComponent={() => <View style={{ width: spacing.xs }} />}
            contentContainerStyle={{ paddingBottom: spacing.sm }}
          />
          <ImageZoomModal
            visible={zoomVisible}
            images={photoUrls.map((url) => ({ url }))}
            initialIndex={zoomIndex}
            onClose={() => setZoomVisible(false)}
          />
        </View>
      ) : photoUrl ? (
        <Pressable onPress={() => { setZoomIndex(0); setZoomVisible(true); }}>
          <View style={styles.photoContainer}>
            <Image source={{ uri: photoUrl }} style={styles.photo} resizeMode="cover" />
          </View>
          <ImageZoomModal
            visible={zoomVisible}
            images={[{ url: photoUrl }]}
            initialIndex={0}
            onClose={() => setZoomVisible(false)}
          />
        </Pressable>
      ) : null}

      {/* Rating */}
      <View style={styles.ratingRow}>
        {studio.rating != null ? (
          <>
            <Text style={styles.starDisplay}>{renderStarRating(studio.rating)}</Text>
            <Text style={styles.ratingText}>{studio.rating.toFixed(1)}</Text>
            {studio.ratingCount != null && <Text style={styles.ratingCount}>({studio.ratingCount} reviews)</Text>}
          </>
        ) : (
          <Text style={styles.noRatingText}>No rating yet</Text>
        )}
        {studio.verified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </View>

      {/* Address */}
      {(studio.formattedAddress || studio.address) && (
        <InfoRow
          icon="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z"
          text={studio.formattedAddress || studio.address!}
          onPress={() => {
            const addr = encodeURIComponent(studio.formattedAddress || studio.address || studio.name);
            Linking.openURL(`https://maps.google.com/?q=${addr}`);
          }}
        />
      )}

      {/* Phone */}
      {studio.phoneNumber && (
        <InfoRow
          icon="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          text={studio.phoneNumber}
          onPress={() => Linking.openURL(`tel:${studio.phoneNumber}`)}
        />
      )}

      {/* Website */}
      {studio.website && (
        <InfoRow
          icon="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          text={studio.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
          onPress={() => {
            // Ensure the URL has a protocol prefix
            const url = studio.website!.startsWith('http') ? studio.website! : `https://${studio.website!}`;
            Linking.openURL(url);
          }}
        />
      )}

      {/* Action Buttons Row */}
      <View style={styles.actionRow}>
        <Pressable style={styles.directionsButton} onPress={handleDirections}>
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.button.primaryText} strokeWidth={2}>
            <Path d="M12 22s-8-4.5-8-11.8A8 8 0 0120 10.2c0 7.3-8 11.8-8 11.8z" />
            <Path d="M12 13a3 3 0 100-6 3 3 0 000 6z" />
          </Svg>
          <Text style={styles.directionsButtonText}>Get Directions</Text>
        </Pressable>
        {studio.phoneNumber && (
          <Pressable style={styles.actionButton} onPress={() => Linking.openURL(`tel:${studio.phoneNumber}`)}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.button.primaryText} strokeWidth={2}>
              <Path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={styles.actionButtonText}>Call</Text>
          </Pressable>
        )}
        {studio.website && (
          <Pressable style={styles.actionButton} onPress={() => {
            const url = studio.website!.startsWith('http') ? studio.website! : `https://${studio.website!}`;
            Linking.openURL(url);
          }}>
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.button.primaryText} strokeWidth={2}>
              <Path d="M12 2a10 10 0 100 20 10 10 0 000-20z" strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M2 12h20" strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
            <Text style={styles.actionButtonText}>Website</Text>
          </Pressable>
        )}
      </View>

      {/* Opening hours */}
      {hours.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Opening Hours</Text>
          <Card padding="md">
            {hours.map((line, i) => (
              <Text key={i} style={styles.hoursText}>{line}</Text>
            ))}
          </Card>
        </View>
      )}

      {/* Amenities */}
      {(studio.amenities ?? []).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            {(studio.amenities ?? []).map((a) => (
              <View key={a} style={styles.amenityChip}>
                <Text style={styles.amenityText}>{getAmenityLabel(a)}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </>
  );
}

function InfoRow({ icon, text, onPress }: { icon: string; text: string; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.infoRow} disabled={!onPress}>
      <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.fg.tertiary} strokeWidth={1.5}>
        <Path d={icon} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
      <Text style={[styles.infoText, onPress && styles.infoTextLink]} numberOfLines={2}>{text}</Text>
    </Pressable>
  );
}

function ClaimForm({ studioId }: { studioId: string }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<string>('owner');
  const [proof, setProof] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Required Fields', 'Please enter your name and email.');
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch(`/api/studios/${studioId}/claim`, {
        method: 'POST',
        body: JSON.stringify({
          claimantName: name.trim(),
          claimantEmail: email.trim().toLowerCase(),
          claimantPhone: phone.trim() || undefined,
          businessRole: role,
          proofDescription: proof.trim() || undefined,
        }),
        skipAuth: true,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Claim Submitted', 'We will review your claim and get back to you.');
      setName(''); setEmail(''); setPhone(''); setProof('');
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to submit claim. You may already have a pending claim.');
    } finally {
      setSubmitting(false);
    }
  };

  const roles = ['owner', 'manager', 'employee'];

  return (
    <View>
      <Text style={styles.formDescription}>If you own or manage this studio, you can claim it to update its information.</Text>
      <Text style={styles.fieldLabel}>Your Name *</Text>
      <TextInput style={styles.fieldInput} value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor={colors.fg.muted} />
      <Text style={styles.fieldLabel}>Email *</Text>
      <TextInput style={styles.fieldInput} value={email} onChangeText={setEmail} placeholder="Email address" placeholderTextColor={colors.fg.muted} keyboardType="email-address" autoCapitalize="none" />
      <Text style={styles.fieldLabel}>Phone (optional)</Text>
      <TextInput style={styles.fieldInput} value={phone} onChangeText={setPhone} placeholder="Phone number" placeholderTextColor={colors.fg.muted} keyboardType="phone-pad" />
      <Text style={styles.fieldLabel}>Your Role</Text>
      <View style={styles.roleRow}>
        {roles.map((r) => (
          <Pressable key={r} onPress={() => setRole(r)} style={[styles.roleChip, role === r && styles.roleChipActive]}>
            <Text style={[styles.roleChipText, role === r && styles.roleChipTextActive]}>{r}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.fieldLabel}>Proof of Ownership (optional)</Text>
      <TextInput style={[styles.fieldInput, styles.textArea]} value={proof} onChangeText={setProof} placeholder="How can we verify you own/manage this studio?" placeholderTextColor={colors.fg.muted} multiline textAlignVertical="top" />
      <Button title={submitting ? 'Submitting...' : 'Submit Claim'} onPress={handleSubmit} disabled={submitting} />
    </View>
  );
}

function SuggestEditForm({ studioId }: { studioId: string }) {
  const [editName, setEditName] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editWebsite, setEditWebsite] = useState('');
  const [reason, setReason] = useState('');
  const [submitterEmail, setSubmitterEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const changes: Record<string, string> = {};
    if (editName.trim()) changes.name = editName.trim();
    if (editAddress.trim()) changes.address = editAddress.trim();
    if (editPhone.trim()) changes.phoneNumber = editPhone.trim();
    if (editWebsite.trim()) changes.website = editWebsite.trim();

    if (Object.keys(changes).length === 0) {
      Alert.alert('No Changes', 'Please fill in at least one field to suggest.');
      return;
    }

    setSubmitting(true);
    try {
      await apiFetch(`/api/studios/${studioId}/suggest-edit`, {
        method: 'POST',
        body: JSON.stringify({
          submitterEmail: submitterEmail.trim().toLowerCase() || undefined,
          suggestedChanges: changes,
          reason: reason.trim() || undefined,
        }),
        skipAuth: true,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Suggestion Submitted', 'Thank you! We will review your suggestion.');
      setEditName(''); setEditAddress(''); setEditPhone(''); setEditWebsite(''); setReason(''); setSubmitterEmail('');
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to submit suggestion.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View>
      <Text style={styles.formDescription}>See something wrong? Suggest corrections and we'll review them.</Text>
      <Text style={styles.fieldLabel}>Your Email (optional)</Text>
      <TextInput style={styles.fieldInput} value={submitterEmail} onChangeText={setSubmitterEmail} placeholder="Email address" placeholderTextColor={colors.fg.muted} keyboardType="email-address" autoCapitalize="none" />
      <Text style={styles.fieldLabel}>Studio Name</Text>
      <TextInput style={styles.fieldInput} value={editName} onChangeText={setEditName} placeholder="Corrected name" placeholderTextColor={colors.fg.muted} />
      <Text style={styles.fieldLabel}>Address</Text>
      <TextInput style={styles.fieldInput} value={editAddress} onChangeText={setEditAddress} placeholder="Corrected address" placeholderTextColor={colors.fg.muted} />
      <Text style={styles.fieldLabel}>Phone Number</Text>
      <TextInput style={styles.fieldInput} value={editPhone} onChangeText={setEditPhone} placeholder="Corrected phone" placeholderTextColor={colors.fg.muted} keyboardType="phone-pad" />
      <Text style={styles.fieldLabel}>Website</Text>
      <TextInput style={styles.fieldInput} value={editWebsite} onChangeText={setEditWebsite} placeholder="Corrected website URL" placeholderTextColor={colors.fg.muted} autoCapitalize="none" keyboardType="url" />
      <Text style={styles.fieldLabel}>Reason (optional)</Text>
      <TextInput style={[styles.fieldInput, styles.textArea]} value={reason} onChangeText={setReason} placeholder="Why is this change needed?" placeholderTextColor={colors.fg.muted} multiline textAlignVertical="top" />
      <Button title={submitting ? 'Submitting...' : 'Submit Suggestion'} onPress={handleSubmit} disabled={submitting} />
    </View>
  );
}

function CommunityPostsSection({ studioId }: { studioId: string }) {
  const { data } = useQuery({
    queryKey: ['studio-community-posts', studioId],
    queryFn: () => getFeed({ studioId, limit: 5 }),
    enabled: !!studioId,
  });

  const posts = data?.posts ?? [];
  if (posts.length === 0) return null;

  return (
    <View style={styles.communitySection}>
      <Text style={styles.communitySectionTitle}>Community Posts</Text>
      <FlatList
        data={posts}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.communityCard}
            onPress={() => router.push(`/(tabs)/community/${item.id}`)}
          >
            {item.mediaUrl ? (
              <Image source={{ uri: item.mediaUrl }} style={styles.communityCardImage} resizeMode="cover" />
            ) : (
              <View style={[styles.communityCardImage, styles.communityCardPlaceholder]}>
                <Text style={styles.communityCardPlaceholderText}>No image</Text>
              </View>
            )}
            {item.caption ? (
              <Text style={styles.communityCardCaption} numberOfLines={2}>{item.caption}</Text>
            ) : null}
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
      />
    </View>
  );
}

function NearbyStudiosCarousel({ studioId, lat, lng }: { studioId: string; lat: number; lng: number }) {
  const { isFavorited, toggleFavorite } = useStudioFavorites();
  const isAuthenticated = !!useAuthStore((s) => s.accessToken);

  const { data } = useQuery({
    queryKey: ['nearby-studios-detail', lat, lng],
    queryFn: () => getNearbyStudios(lat, lng, 10000),
  });

  const nearbyStudios = useMemo(() => {
    if (!data?.studios) return [];
    // Filter out the current studio by both id and placeId to handle format mismatches
    return data.studios
      .filter((s) => s.id !== studioId && s.id !== studioId.replace(/^places\//, ''))
      .slice(0, 5);
  }, [data, studioId]);

  const handleToggleFavorite = (id: string) => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(id);
  };

  if (nearbyStudios.length === 0) return null;

  return (
    <View style={styles.nearbySection}>
      <Text style={styles.nearbySectionTitle}>Nearby Studios</Text>
      <FlatList
        data={nearbyStudios}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(s) => s.id}
        renderItem={({ item }) => (
          <View style={styles.nearbyCardWrapper}>
            <StudioCard
              studio={item}
              isFavorited={isFavorited(item.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  errorText: { fontSize: typography.sizes.base, color: colors.fg.tertiary, marginBottom: spacing.md },
  link: { fontSize: typography.sizes.base, color: colors.fg.primary, textDecorationLine: 'underline' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  backButton: { padding: spacing.xs, marginRight: spacing.sm },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerIconButton: { padding: spacing.xs },
  headerTitle: { flex: 1, fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.fg.primary },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border.default },
  tab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.fg.primary },
  tabText: { fontSize: typography.sizes.sm, color: colors.fg.tertiary, fontWeight: typography.weights.medium },
  tabTextActive: { color: colors.fg.primary },
  scroll: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: 100 },
  photoContainer: { marginBottom: spacing.md, borderRadius: radius.md, overflow: 'hidden' },
  photo: { width: '100%', height: PHOTO_HEIGHT, backgroundColor: colors.cream05 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  starDisplay: { fontSize: 18, color: 'rgba(234, 179, 8, 0.9)', letterSpacing: 2 },
  ratingText: { fontSize: typography.sizes.xl, fontWeight: typography.weights.semibold, color: colors.fg.primary },
  ratingCount: { fontSize: typography.sizes.sm, color: colors.fg.tertiary },
  noRatingText: { fontSize: typography.sizes.sm, color: colors.fg.muted, fontStyle: 'italic' },
  verifiedBadge: { marginLeft: 'auto', paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.full, backgroundColor: 'rgba(34, 197, 94, 0.15)' },
  verifiedText: { fontSize: 11, color: 'rgba(34, 197, 94, 0.9)', fontWeight: typography.weights.medium },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.md },
  infoText: { fontSize: typography.sizes.sm, color: colors.fg.secondary, flex: 1, lineHeight: 20 },
  infoTextLink: { color: colors.fg.primary, textDecorationLine: 'underline' },
  actionRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg, marginTop: spacing.xs },
  directionsButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, backgroundColor: colors.button.primaryBg, paddingVertical: 12, paddingHorizontal: spacing.md, borderRadius: radius.md },
  directionsButtonText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.button.primaryText },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, backgroundColor: colors.button.primaryBg, paddingVertical: 12, paddingHorizontal: spacing.sm, borderRadius: radius.md },
  actionButtonText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.button.primaryText },
  section: { marginBottom: spacing.lg, marginTop: spacing.sm },
  sectionTitle: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: spacing.sm },
  hoursText: { fontSize: typography.sizes.sm, color: colors.fg.secondary, lineHeight: 22 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  amenityChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full, backgroundColor: colors.cream10 },
  amenityText: { fontSize: typography.sizes.sm, color: colors.fg.secondary, textTransform: 'capitalize' },
  formDescription: { fontSize: typography.sizes.sm, color: colors.fg.tertiary, lineHeight: 20, marginBottom: spacing.lg },
  fieldLabel: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: spacing.xs, marginTop: spacing.sm },
  fieldInput: { backgroundColor: colors.bg.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border.default, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: typography.sizes.base, color: colors.fg.primary, marginBottom: spacing.sm },
  textArea: { minHeight: 80 },
  roleRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  roleChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.full, backgroundColor: colors.bg.card, borderWidth: 1, borderColor: colors.border.default },
  roleChipActive: { backgroundColor: colors.fg.primary, borderColor: colors.fg.primary },
  roleChipText: { fontSize: typography.sizes.sm, color: colors.fg.secondary, textTransform: 'capitalize' },
  roleChipTextActive: { color: colors.bg.primary },
  galleryContainer: { marginBottom: spacing.md },
  galleryPhoto: { width: SCREEN_WIDTH * 0.7, height: PHOTO_HEIGHT, borderRadius: radius.md, backgroundColor: colors.cream05 },
  nearbySection: { marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border.default },
  nearbySectionTitle: { fontSize: typography.sizes.base, fontWeight: typography.weights.bold, color: colors.fg.primary, marginBottom: spacing.sm },
  nearbyCardWrapper: { width: SCREEN_WIDTH * 0.75 },
  // Open/Closed banner
  openClosedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  openBanner: { backgroundColor: 'rgba(34, 197, 94, 0.1)', borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.2)' },
  closedBanner: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' },
  openClosedDot: { width: 8, height: 8, borderRadius: 4 },
  openDot: { backgroundColor: colors.success },
  closedDot: { backgroundColor: colors.error },
  openClosedText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium },
  openText: { color: colors.success },
  closedText: { color: colors.error },
  // Community posts section
  communitySection: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  communitySectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.fg.primary,
    marginBottom: spacing.sm,
  },
  communityCard: {
    width: 140,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.bg.card,
  },
  communityCardImage: {
    width: 140,
    height: 140,
    backgroundColor: colors.cream05,
  },
  communityCardPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  communityCardPlaceholderText: {
    fontSize: 11,
    color: colors.fg.muted,
  },
  communityCardCaption: {
    fontSize: 11,
    color: colors.fg.secondary,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    lineHeight: 15,
  },
});
