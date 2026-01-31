import { memo } from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Card } from '@/components/ui';
import { colors, typography, spacing, radius } from '@/theme';
import type { ShopifyProduct } from '@shared/types';

interface ProductCardProps {
  product: ShopifyProduct;
  onAddToCart: (product: ShopifyProduct) => void;
}

function formatPrice(amount: string, currencyCode: string): string {
  const num = parseFloat(amount);
  if (currencyCode === 'INR') return `₹${num.toFixed(0)}`;
  return `${currencyCode} ${num.toFixed(2)}`;
}

export const ProductCard = memo(function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const image = product.images?.[0];
  const price = product.priceRange.minVariantPrice;
  const hasVariants = product.variants.length > 1;
  const inStock = product.variants.some((v) => v.availableForSale);

  return (
    <Card style={styles.card}>
      {image && (
        <Image
          source={{ uri: image.url }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{product.title}</Text>
        <Text style={styles.price}>
          {hasVariants ? 'From ' : ''}{formatPrice(price.amount, price.currencyCode)}
        </Text>
        {!inStock ? (
          <View style={styles.soldOutBadge}>
            <Text style={styles.soldOutText}>Sold Out</Text>
          </View>
        ) : (
          <Pressable onPress={() => onAddToCart(product)} style={styles.addButton}>
            <Text style={styles.addButtonText}>Add to Cart</Text>
          </Pressable>
        )}
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: { flex: 1, overflow: 'hidden', padding: 0 },
  image: { width: '100%', aspectRatio: 1, backgroundColor: colors.cream05 },
  info: { padding: spacing.sm },
  title: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.fg.primary, marginBottom: 4, lineHeight: 18 },
  price: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: spacing.sm },
  addButton: { backgroundColor: colors.fg.primary, borderRadius: radius.sm, paddingVertical: 6, alignItems: 'center' },
  addButtonText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.bg.primary },
  soldOutBadge: { backgroundColor: colors.cream10, borderRadius: radius.sm, paddingVertical: 6, alignItems: 'center' },
  soldOutText: { fontSize: typography.sizes.sm, color: colors.fg.tertiary },
});
