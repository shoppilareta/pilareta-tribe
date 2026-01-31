import { memo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Card } from '@/components/ui';
import { colors, typography, spacing, radius } from '@/theme';
import type { Studio } from '@shared/types';

interface StudioCardProps {
  studio: Studio;
  distance?: number;
}

function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export const StudioCard = memo(function StudioCard({ studio, distance }: StudioCardProps) {
  return (
    <Pressable onPress={() => router.push(`/(tabs)/studios/${studio.id}`)}>
      <Card padding="md" style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.nameContainer}>
            <Text style={styles.name} numberOfLines={1}>{studio.name}</Text>
            {studio.verified && (
              <View style={styles.verifiedBadge}>
                <Svg width={12} height={12} viewBox="0 0 24 24" fill="rgba(34, 197, 94, 0.8)" stroke="none">
                  <Path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </Svg>
              </View>
            )}
          </View>
          {distance != null && (
            <Text style={styles.distance}>{formatDistance(distance)}</Text>
          )}
        </View>

        <View style={styles.infoRow}>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.fg.tertiary} strokeWidth={1.5}>
            <Path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" strokeLinecap="round" strokeLinejoin="round" />
            <Path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text style={styles.address} numberOfLines={1}>
            {studio.formattedAddress || studio.address || studio.city}
          </Text>
        </View>

        {(studio.rating != null || studio.phoneNumber) && (
          <View style={styles.metaRow}>
            {studio.rating != null && (
              <View style={styles.ratingContainer}>
                <Svg width={12} height={12} viewBox="0 0 24 24" fill="rgba(234, 179, 8, 0.8)" stroke="none">
                  <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </Svg>
                <Text style={styles.rating}>{studio.rating.toFixed(1)}</Text>
                {studio.ratingCount != null && (
                  <Text style={styles.ratingCount}>({studio.ratingCount})</Text>
                )}
              </View>
            )}
            {studio.phoneNumber && (
              <Text style={styles.phone} numberOfLines={1}>{studio.phoneNumber}</Text>
            )}
          </View>
        )}

        {studio.amenities.length > 0 && (
          <View style={styles.amenitiesRow}>
            {studio.amenities.slice(0, 3).map((a) => (
              <View key={a} style={styles.amenityChip}>
                <Text style={styles.amenityText}>{a}</Text>
              </View>
            ))}
            {studio.amenities.length > 3 && (
              <Text style={styles.moreText}>+{studio.amenities.length - 3}</Text>
            )}
          </View>
        )}
      </Card>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: { marginBottom: spacing.sm },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  nameContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flex: 1 },
  name: { fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: colors.fg.primary, flex: 1 },
  verifiedBadge: { marginLeft: 2 },
  distance: { fontSize: typography.sizes.sm, color: colors.fg.tertiary, marginLeft: spacing.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  address: { fontSize: typography.sizes.sm, color: colors.fg.secondary, flex: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xs },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  rating: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.fg.primary },
  ratingCount: { fontSize: 11, color: colors.fg.tertiary },
  phone: { fontSize: typography.sizes.sm, color: colors.fg.tertiary },
  amenitiesRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xs },
  amenityChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.xs, backgroundColor: colors.cream05 },
  amenityText: { fontSize: 11, color: colors.fg.tertiary, textTransform: 'capitalize' },
  moreText: { fontSize: 11, color: colors.fg.muted },
});
