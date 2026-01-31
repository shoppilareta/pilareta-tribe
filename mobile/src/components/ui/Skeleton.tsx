import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius } from '@/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

/**
 * Animated skeleton placeholder for loading states.
 * Pulses opacity between 0.3 and 0.7 to indicate loading.
 */
export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = radius.sm,
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.base,
        { width: width as number, height, borderRadius, opacity },
        style,
      ]}
    />
  );
}

/** Pre-composed skeleton layouts for common screens */
export function WorkoutCardSkeleton() {
  return (
    <Animated.View style={skeletonStyles.card}>
      <Skeleton width={120} height={12} />
      <Skeleton width="60%" height={20} style={{ marginTop: 8 }} />
      <Animated.View style={skeletonStyles.row}>
        <Skeleton width={60} height={14} />
        <Skeleton width={60} height={14} />
        <Skeleton width={60} height={14} />
      </Animated.View>
    </Animated.View>
  );
}

export function StatsSkeleton() {
  return (
    <Animated.View style={skeletonStyles.statsGrid}>
      {[1, 2, 3, 4].map((i) => (
        <Animated.View key={i} style={skeletonStyles.statCard}>
          <Skeleton width={40} height={40} borderRadius={20} />
          <Skeleton width={48} height={24} style={{ marginTop: 8 }} />
          <Skeleton width={64} height={12} style={{ marginTop: 4 }} />
        </Animated.View>
      ))}
    </Animated.View>
  );
}

export function FeedPostSkeleton() {
  return (
    <Animated.View style={skeletonStyles.card}>
      <Animated.View style={skeletonStyles.row}>
        <Skeleton width={32} height={32} borderRadius={16} />
        <Skeleton width={100} height={14} />
      </Animated.View>
      <Skeleton width="100%" height={200} borderRadius={radius.md} style={{ marginTop: 12 }} />
      <Skeleton width="80%" height={14} style={{ marginTop: 12 }} />
      <Skeleton width="50%" height={14} style={{ marginTop: 6 }} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.cream10,
  },
});

const skeletonStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: 16,
    alignItems: 'center',
  },
});
