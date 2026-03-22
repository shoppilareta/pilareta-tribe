import { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, TextInput, StyleSheet, SectionList, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';
import { ProductGridSkeleton } from '@/components/ui';
import { ProductCard, BannerCarousel, RecentlyViewedCarousel } from '@/components/shop';
import { getProducts, getWishlist, addToWishlist, removeFromWishlist } from '@/api/shop';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';
import { useRecentlyViewedStore } from '@/stores/recentlyViewedStore';
import type { ShopifyProduct } from '@shared/types';

// Preferred display order for collection-based categories
const COLLECTION_ORDER: Record<string, number> = {
  'bras': 1,
  'tops': 2,
  'lowers': 3,
  'sets': 4,
  'outerwear': 5,
  'accessories': 6,
};

// Fallback keyword matching for products not in any recognized collection
const FALLBACK_LABELS: Record<string, string> = {
  'bra': 'Bras', 'sports bra': 'Bras',
  'top': 'Tops', 'tops': 'Tops', 't-shirt': 'Tops', 'tank': 'Tops', 'crop top': 'Tops',
  'legging': 'Lowers', 'leggings': 'Lowers', 'lower': 'Lowers', 'lowers': 'Lowers',
  'pant': 'Lowers', 'pants': 'Lowers', 'shorts': 'Lowers', 'short': 'Lowers',
  'skort': 'Lowers', 'skorts': 'Lowers', 'jogger': 'Lowers', 'joggers': 'Lowers',
  'set': 'Sets', 'sets': 'Sets', 'co-ord': 'Sets', 'coord': 'Sets',
  'jacket': 'Outerwear', 'hoodie': 'Outerwear', 'outerwear': 'Outerwear', 'sweatshirt': 'Outerwear',
  'accessory': 'Accessories', 'accessories': 'Accessories', 'mat': 'Accessories', 'bag': 'Accessories', 'socks': 'Accessories',
};

function categorizeProduct(product: ShopifyProduct): string {
  // Primary: use Shopify collection data
  if (product.collections && product.collections.length > 0) {
    for (const col of product.collections) {
      const title = col.title.trim();
      // Use the collection title directly as category name
      if (title) return title;
    }
  }

  // Fallback: productType
  const pType = (product.productType || '').toLowerCase().trim();
  if (pType && FALLBACK_LABELS[pType]) return FALLBACK_LABELS[pType];

  // Fallback: tags
  for (const tag of product.tags ?? []) {
    const t = tag.toLowerCase().trim();
    if (FALLBACK_LABELS[t]) return FALLBACK_LABELS[t];
  }

  // Fallback: title keywords
  const title = product.title.toLowerCase();
  for (const [keyword, label] of Object.entries(FALLBACK_LABELS)) {
    if (title.includes(keyword)) return label;
  }

  return 'Other';
}

function getCategoryOrder(label: string): number {
  const normalized = label.toLowerCase();
  if (COLLECTION_ORDER[normalized] !== undefined) return COLLECTION_ORDER[normalized];
  // Check if any key is a substring of the label
  for (const [key, order] of Object.entries(COLLECTION_ORDER)) {
    if (normalized.includes(key)) return order;
  }
  return 99;
}

export default function ShopScreen() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sortOption, setSortOption] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [showSortMenu, setShowSortMenu] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['shop-products'],
    queryFn: getProducts,
  });

  const { totalItems, loading: cartLoading } = useCartStore();
  const cartCount = totalItems();
  const isAuthenticated = !!useAuthStore((s) => s.accessToken);
  const recentlyViewed = useRecentlyViewedStore();
  const queryClient = useQueryClient();

  const { data: wishlistData } = useQuery({
    queryKey: ['wishlist'],
    queryFn: getWishlist,
    enabled: isAuthenticated,
  });

  const wishlistHandles = wishlistData?.handles ?? [];

  const toggleWishlistMutation = useMutation({
    mutationFn: async (handle: string) => {
      const isCurrentlyWishlisted = wishlistHandles.includes(handle);
      if (isCurrentlyWishlisted) {
        return removeFromWishlist(handle);
      } else {
        return addToWishlist(handle);
      }
    },
    onMutate: async (handle: string) => {
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });
      const previous = queryClient.getQueryData<{ handles: string[] }>(['wishlist']);
      queryClient.setQueryData<{ handles: string[] }>(['wishlist'], (old) => {
        if (!old) return { handles: [handle] };
        const exists = old.handles.includes(handle);
        return {
          handles: exists
            ? old.handles.filter((h) => h !== handle)
            : [handle, ...old.handles],
        };
      });
      return { previous };
    },
    onError: (_err, _handle, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['wishlist'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const handleToggleWishlist = useCallback((handle: string) => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleWishlistMutation.mutate(handle);
  }, [isAuthenticated, toggleWishlistMutation]);

  useEffect(() => {
    recentlyViewed.loadFromStorage();
  }, []);

  const products = data?.products ?? [];

  // Build sections grouped by category
  const { sections, categoryNames } = useMemo(() => {
    // Filter by search query (debounced)
    let filtered = products;
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase().trim();
      filtered = products.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.tags && p.tags.some((t: string) => t.toLowerCase().includes(q)))
      );
    }

    // Sort by price if needed
    if (sortOption !== 'default') {
      filtered = [...filtered].sort((a, b) => {
        const priceA = parseFloat(a.priceRange.minVariantPrice.amount);
        const priceB = parseFloat(b.priceRange.minVariantPrice.amount);
        return sortOption === 'price-asc' ? priceA - priceB : priceB - priceA;
      });
    }

    // Categorize into sections
    const categoryMap: Record<string, ShopifyProduct[]> = {};
    for (const p of filtered) {
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
  }, [products, debouncedQuery, sortOption]);

  // Filter sections if a category is active
  const filteredSections = activeCategory
    ? sections.filter((s) => s.title === activeCategory)
    : sections;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Shop</Text>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => {
              if (isAuthenticated) {
                router.push('/orders');
              } else {
                router.push('/auth/login');
              }
            }}
            style={styles.cartButton}
            hitSlop={8}
          >
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={1.5}>
              <Path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)/shop/wishlist')} style={styles.cartButton} hitSlop={8}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={1.5}>
              <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
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
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.fg.tertiary} strokeWidth={2}>
          <Path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={colors.fg.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.fg.tertiary} strokeWidth={2}>
              <Path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
        )}
      </View>

      {/* Category pills */}
      {categoryNames.length > 1 && (
        <View style={styles.pillBar}>
          <View style={styles.pillRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillScroll} style={{ flex: 1 }}>
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
            <Pressable
              style={styles.sortButton}
              onPress={() => setShowSortMenu(!showSortMenu)}
            >
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={sortOption !== 'default' ? colors.fg.primary : colors.fg.tertiary} strokeWidth={2}>
                <Path d="M3 6h18M6 12h12M9 18h6" strokeLinecap="round" />
              </Svg>
              <Text style={[styles.sortLabel, sortOption !== 'default' && { color: colors.fg.primary }]}>
                {sortOption === 'price-asc' ? '\u20B9\u2191' : sortOption === 'price-desc' ? '\u20B9\u2193' : 'Sort'}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Sort dropdown menu */}
      {showSortMenu && (
        <>
          <Pressable style={styles.sortBackdrop} onPress={() => setShowSortMenu(false)} />
          <View style={styles.sortMenu}>
            {([
              { value: 'default' as const, label: 'Default' },
              { value: 'price-asc' as const, label: 'Price: Low to High' },
              { value: 'price-desc' as const, label: 'Price: High to Low' },
            ]).map(opt => (
              <Pressable
                key={opt.value}
                style={[styles.sortMenuItem, sortOption === opt.value && styles.sortMenuItemActive]}
                onPress={() => { setSortOption(opt.value); setShowSortMenu(false); }}
              >
                <Text style={[styles.sortMenuText, sortOption === opt.value && styles.sortMenuTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* Products */}
      {isLoading ? (
        <ProductGridSkeleton />
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
      ) : debouncedQuery && filteredSections.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptySearchTitle}>No products found</Text>
          <Text style={styles.emptySearchSubtitle}>Try a different search term</Text>
          <Pressable onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
            <Text style={styles.clearSearchText}>Clear search</Text>
          </Pressable>
        </View>
      ) : (
        <SectionList
          ListHeaderComponent={
            <>
              <BannerCarousel />
              {recentlyViewed.handles.length > 0 && products.length > 0 && (
                <RecentlyViewedCarousel products={products} handles={recentlyViewed.handles} />
              )}
            </>
          }
          sections={filteredSections}
          keyExtractor={(item) => item.map((p) => p.id).join('-')}
          renderSectionHeader={({ section }) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          renderItem={({ item: pair }) => (
            <View style={styles.row}>
              {pair.map((product) => (
                <View key={product.id} style={styles.productWrapper}>
                  <ProductCard
                    product={product}
                    isWishlisted={wishlistHandles.includes(product.handle)}
                    onToggleWishlist={handleToggleWishlist}
                  />
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
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
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
  signInButton: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.md, backgroundColor: colors.fg.primary },
  signInButtonText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.bg.primary },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(70, 74, 60, 0.3)',
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    height: 40,
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    color: colors.fg.primary,
    fontSize: typography.sizes.sm,
    paddingVertical: 0,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.full,
    gap: 4,
    marginRight: spacing.md,
  },
  sortLabel: {
    fontSize: typography.sizes.xs,
    color: colors.fg.tertiary,
  },
  sortBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 98,
  },
  sortMenu: {
    position: 'absolute',
    right: spacing.md,
    top: 200,
    backgroundColor: 'rgba(50, 54, 42, 0.98)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingVertical: spacing.xs,
    zIndex: 99,
    minWidth: 180,
  },
  sortMenuItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  sortMenuItemActive: {
    backgroundColor: 'rgba(246, 237, 221, 0.1)',
  },
  sortMenuText: {
    fontSize: typography.sizes.sm,
    color: colors.fg.secondary,
  },
  sortMenuTextActive: {
    color: colors.fg.primary,
    fontWeight: typography.weights.semibold,
  },
  emptySearchTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
    marginBottom: spacing.xs,
  },
  emptySearchSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.fg.tertiary,
    marginBottom: spacing.md,
  },
  clearSearchButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  clearSearchText: {
    fontSize: typography.sizes.sm,
    color: colors.fg.secondary,
    fontWeight: typography.weights.medium,
  },
});
