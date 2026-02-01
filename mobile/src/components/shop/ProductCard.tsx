import { memo, useMemo } from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { router } from 'expo-router';
import { Card } from '@/components/ui';
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

  const productColors = useMemo(() => {
    const seen = new Set<string>();
    return product.variants
      .flatMap((v) => v.selectedOptions ?? [])
      .filter((opt) => {
        const isColor = opt.name.toLowerCase() === 'color' || opt.name.toLowerCase() === 'colour';
        if (!isColor || seen.has(opt.value)) return false;
        seen.add(opt.value);
        return true;
      })
      .map((opt) => opt.value);
  }, [product.variants]);

  return (
    <Pressable onPress={() => router.push({ pathname: '/(tabs)/shop/[handle]', params: { handle: product.handle } })}>
      <Card style={styles.card}>
        {image && (
          <Image source={{ uri: image.url }} style={styles.image} resizeMode="cover" />
        )}
        {!inStock && (
          <View style={styles.soldOutBadge}>
            <Text style={styles.soldOutText}>Sold Out</Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
          <Text style={styles.price}>
            {hasMultiplePrices ? 'From ' : ''}{formatPrice(price.amount, price.currencyCode)}
          </Text>
          {productColors.length > 0 && (
            <View style={styles.swatchRow}>
              {productColors.slice(0, 5).map((c) => (
                <View key={c} style={[styles.swatch, { backgroundColor: getColorCode(c) }]} />
              ))}
              {productColors.length > 5 && (
                <Text style={styles.moreColors}>+{productColors.length - 5}</Text>
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
  image: { width: '100%', aspectRatio: 1, backgroundColor: 'rgba(246,237,221,0.05)' },
  soldOutBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(32,34,25,0.85)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  soldOutText: { fontSize: 11, color: colors.fg.tertiary },
  info: { padding: spacing.sm },
  title: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.fg.primary, marginBottom: 4, lineHeight: 18 },
  price: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: 6 },
  swatchRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(246,237,221,0.2)' },
  moreColors: { fontSize: 10, color: colors.fg.muted, marginLeft: 2 },
});
