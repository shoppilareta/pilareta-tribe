import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SectionList, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';
import { ProductCard } from '@/components/shop';
import { getProducts } from '@/api/shop';
import { useCartStore } from '@/stores/cartStore';
import type { ShopifyProduct } from '@shared/types';

// Order and display names for product categories
const CATEGORY_ORDER: Record<string, number> = {
  'bra': 1, 'sports bra': 1,
  'top': 2, 'tops': 2, 't-shirt': 2, 'tank': 2, 'crop top': 2,
  'legging': 3, 'leggings': 3, 'lower': 3, 'lowers': 3, 'pant': 3, 'pants': 3, 'shorts': 3, 'short': 3,
  'set': 4, 'sets': 4, 'co-ord': 4, 'coord': 4,
  'jacket': 5, 'hoodie': 5, 'outerwear': 5, 'sweatshirt': 5,
  'accessory': 6, 'accessories': 6, 'mat': 6, 'bag': 6, 'socks': 6,
};

const CATEGORY_LABELS: Record<string, string> = {
  'bra': 'Bras', 'sports bra': 'Bras',
  'top': 'Tops', 'tops': 'Tops', 't-shirt': 'Tops', 'tank': 'Tops', 'crop top': 'Tops',
  'legging': 'Lowers', 'leggings': 'Lowers', 'lower': 'Lowers', 'lowers': 'Lowers',
  'pant': 'Lowers', 'pants': 'Lowers', 'shorts': 'Lowers', 'short': 'Lowers',
  'set': 'Sets', 'sets': 'Sets', 'co-ord': 'Sets', 'coord': 'Sets',
  'jacket': 'Outerwear', 'hoodie': 'Outerwear', 'outerwear': 'Outerwear', 'sweatshirt': 'Outerwear',
  'accessory': 'Accessories', 'accessories': 'Accessories', 'mat': 'Accessories', 'bag': 'Accessories', 'socks': 'Accessories',
};

function categorizeProduct(product: ShopifyProduct): string {
  // Check productType first (most reliable)
  const pType = (product.productType || '').toLowerCase().trim();
  if (pType && CATEGORY_LABELS[pType]) return CATEGORY_LABELS[pType];

  // Fall back to tags
  for (const tag of product.tags ?? []) {
    const t = tag.toLowerCase().trim();
    if (CATEGORY_LABELS[t]) return CATEGORY_LABELS[t];
  }

  // Fall back to title keywords
  const title = product.title.toLowerCase();
  for (const [keyword, label] of Object.entries(CATEGORY_LABELS)) {
    if (title.includes(keyword)) return label;
  }

  return 'Other';
}

function getCategoryOrder(label: string): number {
  for (const [key, mapped] of Object.entries(CATEGORY_LABELS)) {
    if (mapped === label && CATEGORY_ORDER[key] !== undefined) return CATEGORY_ORDER[key];
  }
  return 99;
}

export default function ShopScreen() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['shop-products'],
    queryFn: getProducts,
  });

  const { totalItems, loading: cartLoading } = useCartStore();
  const cartCount = totalItems();

  const products = data?.products ?? [];

  // Build sections grouped by category
  const { sections, categoryNames } = useMemo(() => {
    const categoryMap: Record<string, ShopifyProduct[]> = {};
    for (const p of products) {
      const cat = categorizeProduct(p);
      if (!categoryMap[cat]) categoryMap[cat] = [];
      categoryMap[cat].push(p);
    }

    const sortedCategories = Object.keys(categoryMap).sort(
      (a, b) => getCategoryOrder(a) - getCategoryOrder(b)
    );

    const sectionList = sortedCategories.map((cat) => ({
      title: cat,
      data: chunkPairs(categoryMap[cat]),
    }));

    return { sections: sectionList, categoryNames: sortedCategories };
  }, [products]);

  // Filter sections if a category is active
  const filteredSections = activeCategory
    ? sections.filter((s) => s.title === activeCategory)
    : sections;

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

      {/* Category pills */}
      {categoryNames.length > 1 && (
        <View style={styles.pillBar}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillScroll}>
            <Pressable
              style={[styles.pill, !activeCategory && styles.pillActive]}
              onPress={() => setActiveCategory(null)}
            >
              <Text style={[styles.pillText, !activeCategory && styles.pillTextActive]}>All</Text>
            </Pressable>
            {categoryNames.map((cat) => (
              <Pressable
                key={cat}
                style={[styles.pill, activeCategory === cat && styles.pillActive]}
                onPress={() => setActiveCategory(activeCategory === cat ? null : cat)}
              >
                <Text style={[styles.pillText, activeCategory === cat && styles.pillTextActive]}>{cat}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Products */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.fg.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>Something went wrong</Text>
          <Text style={styles.emptyText}>We couldn't load the shop. Please try again.</Text>
          <Pressable onPress={() => refetch()} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No products available</Text>
          <Text style={styles.emptyText}>Check back soon for new items.</Text>
        </View>
      ) : (
        <SectionList
          sections={filteredSections}
          keyExtractor={(item) => item.map((p) => p.id).join('-')}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          renderItem={({ item: pair }) => (
            <View style={styles.row}>
              {pair.map((product) => (
                <View key={product.id} style={styles.productWrapper}>
                  <ProductCard product={product} />
                </View>
              ))}
              {pair.length === 1 && <View style={styles.productWrapper} />}
            </View>
          )}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
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

/** Split array into pairs for 2-column grid */
function chunkPairs<T>(arr: T[]): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += 2) {
    result.push(arr.slice(i, i + 2));
  }
  return result;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  title: { fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, color: colors.fg.primary },
  cartButton: { padding: spacing.xs, position: 'relative' },
  cartBadge: { position: 'absolute', top: -2, right: -4, backgroundColor: 'rgba(239, 68, 68, 0.9)', borderRadius: 10, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  cartBadgeText: { fontSize: 10, fontWeight: typography.weights.bold, color: '#fff' },
  pillBar: { borderBottomWidth: 1, borderBottomColor: colors.border.default },
  pillScroll: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.xs },
  pill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(246,237,221,0.15)' },
  pillActive: { backgroundColor: colors.fg.primary, borderColor: colors.fg.primary },
  pillText: { fontSize: typography.sizes.sm, color: colors.fg.secondary, fontWeight: typography.weights.medium },
  pillTextActive: { color: colors.bg.primary },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: spacing.sm },
  emptyText: { fontSize: typography.sizes.sm, color: colors.fg.tertiary, textAlign: 'center' },
  sectionHeader: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.fg.primary, paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.xs },
  grid: { paddingBottom: 100 },
  row: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  productWrapper: { flex: 1 },
  retryButton: { marginTop: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: colors.fg.primary },
  retryButtonText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.bg.primary },
  cartLoading: { position: 'absolute', bottom: spacing.xl, alignSelf: 'center', backgroundColor: colors.bg.card, borderRadius: 999, padding: spacing.sm, borderWidth: 1, borderColor: colors.border.default },
});
