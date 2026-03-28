import { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius } from '@/theme';
import { ProductCard } from '@/components/shop';
import { getProducts, getWishlist, addToWishlist, removeFromWishlist } from '@/api/shop';
import { useAuthStore } from '@/stores/authStore';

function BackArrow() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
      <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function WishlistScreen() {
  const isAuthenticated = !!useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  const { data: wishlistData, isLoading: wishlistLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: getWishlist,
    enabled: isAuthenticated,
  });

  const { data: productsData } = useQuery({
    queryKey: ['shop-products'],
    queryFn: getProducts,
  });

  const wishlistHandles = wishlistData?.handles ?? [];
  const allProducts = productsData?.products ?? [];
  const wishlistCount = wishlistHandles.length;

  const wishlistedProducts = useMemo(() => {
    if (!wishlistHandles.length || !allProducts.length) return [];
    // Maintain wishlist order
    return wishlistHandles
      .map((h) => allProducts.find((p) => p.handle === h))
      .filter(Boolean) as typeof allProducts;
  }, [wishlistHandles, allProducts]);

  const unmatchedCount = allProducts.length > 0 ? wishlistHandles.length - wishlistedProducts.length : 0;

  const toggleMutation = useMutation({
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

  const handleToggleWishlist = (handle: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleMutation.mutate(handle);
  };

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.headerBar}>
          <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8} accessibilityLabel="Go back" accessibilityRole="button">
            <BackArrow />
          </Pressable>
          <Text style={styles.headerTitle}>My Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.centered}>
          <Svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke={colors.fg.muted} strokeWidth={1.5}>
            <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </Svg>
          <Text style={styles.emptyTitle}>Sign in to save your favorites</Text>
          <Text style={styles.emptyText}>Create an account to start building your wishlist.</Text>
          <Pressable onPress={() => router.push('/auth/login')} style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Sign In</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Loading
  if (wishlistLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.headerBar}>
          <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8} accessibilityLabel="Go back" accessibilityRole="button">
            <BackArrow />
          </Pressable>
          <Text style={styles.headerTitle}>My Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.centered}>
          <ActivityIndicator color={colors.fg.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Empty state
  if (wishlistedProducts.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.headerBar}>
          <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8} accessibilityLabel="Go back" accessibilityRole="button">
            <BackArrow />
          </Pressable>
          <Text style={styles.headerTitle}>My Wishlist{wishlistCount > 0 ? ` (${wishlistCount})` : ''}</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.centered}>
          <Svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke={colors.fg.muted} strokeWidth={1.5}>
            <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </Svg>
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptyText}>Tap the heart icon on products you love to save them here.</Text>
          <Pressable onPress={() => router.back()} style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Browse Shop</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Grid of wishlisted products
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
          <BackArrow />
        </Pressable>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <View style={{ width: 36 }} />
      </View>
      {unmatchedCount > 0 && (
        <View style={styles.unavailableBanner}>
          <Text style={styles.unavailableText}>Some wishlisted items are no longer available</Text>
        </View>
      )}
      <FlatList
        data={wishlistedProducts}
        numColumns={2}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.productWrapper}>
            <ProductCard
              product={item}
              isWishlisted={wishlistHandles.includes(item.handle)}
              onToggleWishlist={handleToggleWishlist}
            />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  backButton: { padding: spacing.xs },
  headerTitle: {
    flex: 1,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
    textAlign: 'center',
    marginHorizontal: spacing.sm,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.fg.tertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButton: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.fg.primary,
  },
  actionButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.bg.primary,
  },
  unavailableBanner: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: radius.sm,
  },
  unavailableText: {
    fontSize: typography.sizes.xs,
    color: colors.warning,
    textAlign: 'center',
  },
  grid: { paddingBottom: 100 },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  productWrapper: { flex: 1 },
});
