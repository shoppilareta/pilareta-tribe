import { memo, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Image, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Card } from '@/components/ui';
import { useCartStore } from '@/stores/cartStore';
import { colors, typography, spacing, radius } from '@/theme';
import { getColorCode } from '@/utils/colorCode';
import type { ShopifyProduct } from '@shared/types';

interface ProductCardProps {
  product: ShopifyProduct;
}

function formatPrice(amount: string, currencyCode: string): string {
  const num = parseFloat(amount);
  if (currencyCode === 'INR') return `\u20B9${num.toFixed(0)}`;
  return `${currencyCode} ${num.toFixed(2)}`;
}

export const ProductCard = memo(function ProductCard({ product }: ProductCardProps) {
  const image = product.images?.[0];
  const price = product.priceRange.minVariantPrice;
  const hasMultiplePrices = product.priceRange.minVariantPrice.amount !== product.priceRange.maxVariantPrice.amount;
  const inStock = product.availableForSale !== false && product.variants.some((v) => v.availableForSale);

  const colorSwatches = useMemo(() => {
    const seen = new Map<string, string | undefined>();
    for (const v of product.variants) {
      for (const opt of v.selectedOptions ?? []) {
        const isColor = opt.name.toLowerCase() === 'color' || opt.name.toLowerCase() === 'colour';
        if (isColor && !seen.has(opt.value)) {
          seen.set(opt.value, v.image?.url);
        }
      }
    }
    return Array.from(seen.entries()).map(([name, imageUrl]) => ({ name, imageUrl }));
  }, [product.variants]);

  const { addItem } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);

  // Single-variant = exactly 1 variant that's available for sale
  const quickAddVariant = useMemo(() => {
    const available = product.variants.filter((v: any) => v.availableForSale !== false);
    return available.length === 1 ? available[0] : null;
  }, [product.variants]);

  const handleQuickAdd = async () => {
    if (!quickAddVariant || isAdding) return;
    setIsAdding(true);
    try {
      await addItem(quickAddVariant.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Pressable onPress={() => router.push({ pathname: '/(tabs)/shop/[handle]', params: { handle: product.handle } })}>
      <Card style={styles.card}>
        <View style={styles.imageContainer}>
          {image && (
            <Image source={{ uri: image.url }} style={styles.image} resizeMode="cover" />
          )}
          {!inStock && (
            <View style={styles.soldOutBadge}>
              <Text style={styles.soldOutText}>Sold Out</Text>
            </View>
          )}
          {quickAddVariant && product.availableForSale && (
            <Pressable
              style={styles.quickAddButton}
              onPress={(e) => {
                e.stopPropagation();
                handleQuickAdd();
              }}
              hitSlop={4}
            >
              {isAdding ? (
                <ActivityIndicator size="small" color={colors.bg.primary} />
              ) : (
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.bg.primary} strokeWidth={2.5}>
                  <Path d="M12 5v14M5 12h14" strokeLinecap="round" />
                </Svg>
              )}
            </Pressable>
          )}
        </View>
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
          <Text style={styles.price}>
            {hasMultiplePrices ? 'From ' : ''}{formatPrice(price.amount, price.currencyCode)}
          </Text>
          {colorSwatches.length > 0 && (
            <View style={styles.swatchRow}>
              {colorSwatches.slice(0, 5).map((s) => (
                s.imageUrl ? (
                  <Image key={s.name} source={{ uri: s.imageUrl }} style={styles.swatchImage} />
                ) : (
                  <View key={s.name} style={[styles.swatch, { backgroundColor: getColorCode(s.name) }]} />
                )
              ))}
              {colorSwatches.length > 5 && (
                <Text style={styles.moreColors}>+{colorSwatches.length - 5}</Text>
              )}
            </View>
          )}
        </View>
      </Card>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: { flex: 1, overflow: 'hidden', padding: 0 },
  imageContainer: { position: 'relative', width: '100%', aspectRatio: 1 },
  image: { width: '100%', height: '100%', backgroundColor: 'rgba(246,237,221,0.05)' },
  soldOutBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(32,34,25,0.85)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  soldOutText: { fontSize: 11, color: colors.fg.tertiary },
  info: { padding: spacing.sm },
  title: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.fg.primary, marginBottom: 4, lineHeight: 18 },
  price: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: 6 },
  swatchRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(246,237,221,0.2)' },
  swatchImage: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(246,237,221,0.2)', overflow: 'hidden' },
  moreColors: { fontSize: 10, color: colors.fg.muted, marginLeft: 2 },
  quickAddButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.fg.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
});
