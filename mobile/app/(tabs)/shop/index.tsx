import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';
import { ProductCard } from '@/components/shop';
import { getProducts } from '@/api/shop';
import { useCartStore } from '@/stores/cartStore';
import type { ShopifyProduct } from '@shared/types';

export default function ShopScreen() {
  const { data, isLoading } = useQuery({
    queryKey: ['shop-products'],
    queryFn: getProducts,
  });

  const { addItem, totalItems, loading: cartLoading } = useCartStore();
  const cartCount = totalItems();

  const handleAddToCart = async (product: ShopifyProduct) => {
    const availableVariant = product.variants.find((v) => v.availableForSale);
    if (!availableVariant) {
      Alert.alert('Sold Out', 'This product is currently unavailable.');
      return;
    }

    try {
      await addItem(availableVariant.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to add item to cart.');
    }
  };

  const products = data?.products ?? [];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Shop</Text>
        <Pressable onPress={() => router.push('/(tabs)/shop/cart')} style={styles.cartButton} hitSlop={8}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={1.5}>
            <Path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Products */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.fg.primary} />
        </View>
      ) : products.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No products available</Text>
          <Text style={styles.emptyText}>Check back soon for new items.</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p) => p.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.productWrapper}>
              <ProductCard product={item} onAddToCart={handleAddToCart} />
            </View>
          )}
        />
      )}

      {/* Cart loading overlay */}
      {cartLoading && (
        <View style={styles.cartLoading}>
          <ActivityIndicator color={colors.fg.primary} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  title: { fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, color: colors.fg.primary },
  cartButton: { padding: spacing.xs, position: 'relative' },
  cartBadge: { position: 'absolute', top: -2, right: -4, backgroundColor: 'rgba(239, 68, 68, 0.9)', borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  cartBadgeText: { fontSize: 10, fontWeight: typography.weights.bold, color: '#fff' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: spacing.sm },
  emptyText: { fontSize: typography.sizes.sm, color: colors.fg.tertiary, textAlign: 'center' },
  grid: { padding: spacing.md },
  row: { gap: spacing.sm, marginBottom: spacing.sm },
  productWrapper: { flex: 1 },
  cartLoading: { position: 'absolute', bottom: spacing.xl, alignSelf: 'center', backgroundColor: colors.bg.card, borderRadius: radius.full, padding: spacing.sm, borderWidth: 1, borderColor: colors.border.default },
});
