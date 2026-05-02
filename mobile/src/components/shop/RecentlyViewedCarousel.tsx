import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, radius } from '@/theme';
import { formatPrice } from '@/utils/formatPrice';
import type { ShopifyProduct } from '@shared/types';

interface Props {
  products: ShopifyProduct[];
  handles: string[];
}

export function RecentlyViewedCarousel({ products, handles }: Props) {
  const router = useRouter();

  const items = handles
    .map(h => products.find(p => p.handle === h))
    .filter(Boolean) as ShopifyProduct[];

  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recently Viewed</Text>
      <FlatList
        data={items}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={item => item.handle}
        contentContainerStyle={{ paddingHorizontal: spacing.md }}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push({ pathname: '/(tabs)/shop/[handle]', params: { handle: item.handle } })}
            accessibilityLabel={`${item.title}, ${formatPrice(item.priceRange?.minVariantPrice?.amount ?? '0', item.priceRange?.minVariantPrice?.currencyCode ?? 'INR')}`}
            accessibilityRole="button"
          >
            {item.images?.[0] ? (
              <Image
                source={{ uri: item.images[0].url }}
                style={styles.image}
                contentFit="cover"
                cachePolicy="memory-disk"
                transition={120}
                recyclingKey={item.images[0].url}
              />
            ) : (
              <View style={[styles.image, styles.imagePlaceholder]} />
            )}
            <Text style={styles.name} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.price}>
              {formatPrice(item.priceRange?.minVariantPrice?.amount ?? '0', item.priceRange?.minVariantPrice?.currencyCode ?? 'INR')}
            </Text>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={{ width: spacing.sm }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  card: {
    width: 120,
    backgroundColor: 'rgba(70, 74, 60, 0.3)',
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  image: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(246,237,221,0.05)',
  },
  imagePlaceholder: {
    backgroundColor: 'rgba(70, 74, 60, 0.3)',
  },
  name: {
    fontSize: typography.sizes.xs,
    color: colors.fg.secondary,
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.xs,
  },
  price: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.xs,
  },
});
