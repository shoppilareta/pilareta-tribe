import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  Dimensions,
  Linking,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { colors, typography, spacing, radius } from '@/theme';
import { apiFetch } from '@/api/client';

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  linkText: string | null;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - spacing.md * 2;
const BANNER_HEIGHT = BANNER_WIDTH / 2.5;

async function getBanners(): Promise<Banner[]> {
  const data = await apiFetch('/api/shop/banners', { skipAuth: true });
  return data.banners ?? [];
}

export function BannerCarousel() {
  const flatListRef = useRef<FlatList<Banner>>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: banners = [] } = useQuery({
    queryKey: ['shop-banners'],
    queryFn: getBanners,
    staleTime: 5 * 60 * 1000,
  });

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % banners.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const handlePress = (banner: Banner) => {
    if (banner.linkUrl) {
      Linking.openURL(banner.linkUrl).catch(() => {});
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        snapToInterval={BANNER_WIDTH + spacing.sm}
        decelerationRate="fast"
        contentContainerStyle={{ gap: spacing.sm, paddingHorizontal: spacing.md }}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / (BANNER_WIDTH + spacing.sm));
          setCurrentIndex(idx);
        }}
        getItemLayout={(_, index) => ({
          length: BANNER_WIDTH + spacing.sm,
          offset: (BANNER_WIDTH + spacing.sm) * index,
          index,
        })}
        renderItem={({ item }) => (
          <Pressable onPress={() => handlePress(item)} style={styles.bannerCard}>
            <Image source={{ uri: item.imageUrl }} style={styles.bannerImage} resizeMode="cover" />
            <View style={styles.overlay} />
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle} numberOfLines={2}>
                {item.title}
              </Text>
              {item.subtitle && (
                <Text style={styles.bannerSubtitle} numberOfLines={2}>
                  {item.subtitle}
                </Text>
              )}
              {item.linkUrl && (
                <View style={styles.ctaButton}>
                  <Text style={styles.ctaText}>{item.linkText || 'Shop Now'}</Text>
                </View>
              )}
            </View>
          </Pressable>
        )}
      />

      {/* Dots indicator */}
      {banners.length > 1 && (
        <View style={styles.dots}>
          {banners.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.sm,
  },
  bannerCard: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    borderRadius: radius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(32,34,25,0.4)',
  },
  bannerContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
  },
  bannerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.fg.primary,
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.fg.secondary,
    marginBottom: spacing.sm,
  },
  ctaButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.fg.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.md,
  },
  ctaText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.bg.primary,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.fg.primary,
  },
  dotInactive: {
    width: 6,
    backgroundColor: colors.fg.muted,
  },
});
