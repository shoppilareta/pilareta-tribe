import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@/theme';

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

/** ─── Studio skeleton loaders ─── */

export function StudioCardSkeleton() {
  return (
    <View style={studioSkeletonStyles.card}>
      <View style={studioSkeletonStyles.photo} />
      <View style={studioSkeletonStyles.content}>
        <Skeleton width="70%" height={14} />
        <View style={studioSkeletonStyles.addressRow}>
          <Skeleton width={14} height={14} borderRadius={7} />
          <Skeleton width="55%" height={12} />
        </View>
        <View style={studioSkeletonStyles.metaRow}>
          <Skeleton width={50} height={12} />
          <Skeleton width={70} height={12} />
        </View>
      </View>
    </View>
  );
}

export function StudioListSkeleton() {
  return (
    <View style={studioSkeletonStyles.list}>
      {[1, 2, 3, 4].map((i) => (
        <StudioCardSkeleton key={i} />
      ))}
    </View>
  );
}

const studioSkeletonStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  photo: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: colors.cream05,
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  list: {
    padding: spacing.md,
  },
});

/** ─── Shop skeleton loaders ─── */

export function ProductCardSkeleton() {
  return (
    <View style={productSkeletonStyles.card}>
      <View style={productSkeletonStyles.image} />
      <View style={productSkeletonStyles.info}>
        <Skeleton width="70%" height={12} />
        <Skeleton width="40%" height={10} style={{ marginTop: 6 }} />
        <View style={productSkeletonStyles.swatchRow}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} width={20} height={20} borderRadius={10} />
          ))}
        </View>
      </View>
    </View>
  );
}

export function ProductGridSkeleton() {
  return (
    <View style={productSkeletonStyles.grid}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <View key={i} style={productSkeletonStyles.gridItem}>
          <ProductCardSkeleton />
        </View>
      ))}
    </View>
  );
}

export function CartItemSkeleton() {
  return (
    <View style={cartSkeletonStyles.container}>
      <View style={cartSkeletonStyles.image} />
      <View style={cartSkeletonStyles.info}>
        <Skeleton width="75%" height={12} />
        <Skeleton width="40%" height={12} style={{ marginTop: 6 }} />
        <Skeleton width={90} height={28} borderRadius={radius.sm} style={{ marginTop: spacing.sm }} />
      </View>
    </View>
  );
}

export function CartSkeleton() {
  return (
    <View style={cartSkeletonStyles.list}>
      {[1, 2, 3].map((i) => (
        <CartItemSkeleton key={i} />
      ))}
    </View>
  );
}

const productSkeletonStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.cream05,
  },
  info: {
    padding: spacing.sm,
  },
  swatchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  gridItem: {
    flex: 1,
    minWidth: '45%',
  },
});

const cartSkeletonStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: radius.sm,
    backgroundColor: colors.cream05,
    marginRight: spacing.sm,
  },
  info: {
    flex: 1,
  },
  list: {
    paddingHorizontal: spacing.md,
  },
});

/** ─── Community skeleton loader ─── */

export function CommunityFeedSkeleton() {
  return (
    <View style={{ padding: spacing.md }}>
      {[1, 2, 3].map(i => (
        <View key={i} style={{ marginBottom: spacing.md }}>
          {/* Author row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
            <Skeleton style={{ width: 36, height: 36, borderRadius: 18 }} />
            <View style={{ marginLeft: spacing.sm }}>
              <Skeleton style={{ width: 100, height: 12, borderRadius: 4 }} />
              <Skeleton style={{ width: 60, height: 10, borderRadius: 4, marginTop: 4 }} />
            </View>
          </View>
          {/* Image */}
          <Skeleton style={{ width: '100%', aspectRatio: 1, borderRadius: radius.md }} />
          {/* Caption */}
          <Skeleton style={{ width: '80%', height: 12, borderRadius: 4, marginTop: spacing.sm }} />
          <Skeleton style={{ width: '50%', height: 12, borderRadius: 4, marginTop: 4 }} />
        </View>
      ))}
    </View>
  );
}

/** ─── Learn skeleton loader ─── */

export function LearnSkeleton() {
  return (
    <View style={{ padding: spacing.md }}>
      {/* Search bar placeholder */}
      <Skeleton style={{ height: 40, borderRadius: radius.md, marginBottom: spacing.md }} />
      {/* Tab bar placeholder */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        <Skeleton style={{ width: 80, height: 32, borderRadius: radius.full }} />
        <Skeleton style={{ width: 80, height: 32, borderRadius: radius.full }} />
      </View>
      {/* Cards */}
      {[1, 2, 3, 4].map(i => (
        <Skeleton key={i} style={{ height: 80, borderRadius: radius.md, marginBottom: spacing.sm }} />
      ))}
    </View>
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
