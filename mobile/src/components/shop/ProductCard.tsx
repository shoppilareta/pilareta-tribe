import { memo, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Image, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Card } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { useCartStore } from '@/stores/cartStore';
import { colors, typography, spacing, radius } from '@/theme';
import { getColorCode } from '@/utils/colorCode';
import { formatPrice } from '@/utils/formatPrice';
import type { ShopifyProduct } from '@shared/types';

interface ProductCardProps {
  product: ShopifyProduct;
  isWishlisted?: boolean;
  onToggleWishlist?: (handle: string) => void;
}

export const ProductCard = memo(function ProductCard({ product, isWishlisted, onToggleWishlist }: ProductCardProps) {
  const image = product.images?.[0];
  const price = product.priceRange?.minVariantPrice ?? { amount: '0', currencyCode: 'INR' };
  const maxPrice = product.priceRange?.maxVariantPrice ?? price;
  const hasMultiplePrices = price.amount !== maxPrice.amount;
  const inStock = product.availableForSale !== false && product.variants?.some((v) => v.availableForSale);

  const { hasSale, savePercent, compareAtPrice } = useMemo(() => {
    const firstAvailable = (product.variants ?? []).find((v) => v.availableForSale);
    if (
      firstAvailable?.compareAtPrice &&
      parseFloat(firstAvailable.compareAtPrice.amount) > parseFloat(firstAvailable.price.amount)
    ) {
      const cap = parseFloat(firstAvailable.compareAtPrice.amount);
      const cur = parseFloat(firstAvailable.price.amount);
      return {
        hasSale: true,
        savePercent: Math.round((1 - cur / cap) * 100),
        compareAtPrice: firstAvailable.compareAtPrice,
      };
    }
    return { hasSale: false, savePercent: 0, compareAtPrice: null };
  }, [product.variants]);

  const colorSwatches = useMemo(() => {
    const seen = new Map<string, string | undefined>();
    for (const v of product.variants ?? []) {
      for (const opt of v.selectedOptions ?? []) {
        const isColor = opt.name.toLowerCase() === 'color' || opt.name.toLowerCase() === 'colour';
        if (isColor && !seen.has(opt.value)) {
          seen.set(opt.value, v.image?.url);
        }
      }
    }
    return Array.from(seen.entries()).map(([name, imageUrl]) => ({ name, imageUrl }));
  }, [product.variants]);

  const lowStockCount = useMemo(() => {
    const firstAvailable = (product.variants ?? []).find((v) => v.availableForSale);
    if (firstAvailable?.quantityAvailable != null && firstAvailable.quantityAvailable > 0 && firstAvailable.quantityAvailable < 5) {
      return firstAvailable.quantityAvailable;
    }
    return null;
  }, [product.variants]);

  const { addItem } = useCartStore();
  const { showToast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  // Single-variant = exactly 1 variant that's available for sale
  const quickAddVariant = useMemo(() => {
    const available = (product.variants ?? []).filter((v: any) => v.availableForSale !== false);
    return available.length === 1 ? available[0] : null;
  }, [product.variants]);

  const handleQuickAdd = async () => {
    if (!quickAddVariant || isAdding) return;
    setIsAdding(true);
    try {
      await addItem(quickAddVariant.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast('Added to cart');
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast('Failed to add', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/(tabs)/shop/[handle]', params: { handle: product.handle } })}
      accessibilityLabel={`${product.title}, ${formatPrice(price.amount, price.currencyCode)}${!inStock ? ', sold out' : ''}`}
      accessibilityRole="button"
    >
      <Card style={styles.card}>
        <View style={styles.imageContainer}>
          {image ? (
            <Image source={{ uri: image.url }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={colors.fg.muted} strokeWidth={1.5}>
                <Path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </View>
          )}
          {hasSale && (
            <View style={styles.saleBadge}>
              <Text style={styles.saleBadgeText}>SALE</Text>
            </View>
          )}
          {onToggleWishlist && (
            <Pressable
              style={styles.heartButton}
              onPress={(e) => {
                e.stopPropagation();
                onToggleWishlist(product.handle);
              }}
              hitSlop={6}
              accessibilityLabel={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              accessibilityRole="button"
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill={isWishlisted ? colors.error : 'none'} stroke={isWishlisted ? colors.error : colors.bg.primary} strokeWidth={2}>
                <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </Svg>
            </Pressable>
          )}
          {!inStock && (
            <View style={styles.soldOutBadge}>
              <Text style={styles.soldOutText}>Sold Out</Text>
            </View>
          )}
          {quickAddVariant && product.availableForSale && (
            <Pressable
              style={[styles.quickAddButton, isAdding && { opacity: 0.7 }]}
              onPress={(e) => {
                e.stopPropagation();
                handleQuickAdd();
              }}
              hitSlop={4}
              disabled={isAdding}
              accessibilityLabel="Quick add to cart"
              accessibilityRole="button"
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
          {hasSale && compareAtPrice ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.comparePrice}>
                {formatPrice(compareAtPrice.amount, compareAtPrice.currencyCode)}
              </Text>
              <Text style={styles.salePrice}>
                {formatPrice(price.amount, price.currencyCode)}
              </Text>
            </View>
          ) : (
            <Text style={styles.price}>
              {hasMultiplePrices
                ? `${formatPrice(price.amount, price.currencyCode)} - ${formatPrice(maxPrice.amount, maxPrice.currencyCode)}`
                : formatPrice(price.amount, price.currencyCode)}
            </Text>
          )}
          {lowStockCount !== null && (
            <Text style={styles.lowStock}>{lowStockCount} left</Text>
          )}
          {colorSwatches.length > 0 && (
            <View style={styles.swatchRow}>
              {colorSwatches.slice(0, 5).map((s) => (
                <View key={s.name} style={[styles.swatch, { backgroundColor: getColorCode(s.name) }]} />
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
  imagePlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg.card },
  saleBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(239, 68, 68, 0.9)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, zIndex: 1 },
  saleBadgeText: { fontSize: 10, fontWeight: typography.weights.bold, color: '#fff', letterSpacing: 0.5 },
  soldOutBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: 'rgba(32,34,25,0.85)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  soldOutText: { fontSize: 11, color: colors.fg.tertiary },
  info: { padding: spacing.sm },
  title: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.fg.primary, marginBottom: 4, lineHeight: 18 },
  price: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: 6 },
  comparePrice: { fontSize: typography.sizes.sm, color: colors.fg.muted, textDecorationLine: 'line-through' },
  salePrice: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.error, marginBottom: 6 },
  lowStock: { fontSize: typography.sizes.xs, fontWeight: typography.weights.bold, color: colors.warning, marginBottom: 4 },
  swatchRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(246,237,221,0.2)' },
  moreColors: { fontSize: 10, color: colors.fg.muted, marginLeft: 2 },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
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
