import { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';
import { StudioCard } from '@/components/studios';
import { getStudio } from '@/api/studios';
import { useStudioFavorites } from '@/hooks/useStudioFavorites';
import { useAuthStore } from '@/stores/authStore';

export default function FavoritesScreen() {
  const isAuthenticated = !!useAuthStore((s) => s.accessToken);
  const { favoriteIds, isFavorited, toggleFavorite } = useStudioFavorites();
  const queryClient = useQueryClient();

  // Refresh favorites list when screen comes into focus (e.g., after toggling from detail screen)
  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        queryClient.invalidateQueries({ queryKey: ['studioFavorites'] });
      }
    }, [isAuthenticated, queryClient])
  );

  const handleToggleFavorite = useCallback((studioId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavorite(studioId);
  }, [toggleFavorite]);

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Header />
        <View style={styles.centered}>
          <Svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke={colors.fg.muted} strokeWidth={1.5}>
            <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </Svg>
          <Text style={styles.emptyTitle}>Sign in to save studios</Text>
          <Text style={styles.emptyText}>Create an account or sign in to save your favorite Pilates studios.</Text>
          <Pressable style={styles.primaryButton} onPress={() => router.push('/auth/login')}>
            <Text style={styles.primaryButtonText}>Sign In</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header />
      {favoriteIds.length === 0 ? (
        <View style={styles.centered}>
          <Svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke={colors.fg.muted} strokeWidth={1.5}>
            <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
          </Svg>
          <Text style={styles.emptyTitle}>No saved studios yet</Text>
          <Text style={styles.emptyText}>Tap the heart icon on any studio to save it here for easy access.</Text>
          <Pressable style={styles.primaryButton} onPress={() => router.push('/(tabs)/studios')}>
            <Text style={styles.primaryButtonText}>Explore Studios</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={favoriteIds}
          keyExtractor={(id) => id}
          renderItem={({ item: studioId }) => (
            <FavoriteStudioItem
              studioId={studioId}
              isFavorited={isFavorited(studioId)}
              onToggleFavorite={handleToggleFavorite}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

function Header() {
  return (
    <View style={styles.header}>
      <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
        <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
          <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </Pressable>
      <Text style={styles.headerTitle}>Saved Studios</Text>
      <View style={{ width: 36 }} />
    </View>
  );
}

function FavoriteStudioItem({ studioId, isFavorited, onToggleFavorite }: {
  studioId: string;
  isFavorited: boolean;
  onToggleFavorite: (id: string) => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['studio-detail', studioId],
    queryFn: () => getStudio(studioId),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <View style={styles.loadingItem}>
        <ActivityIndicator size="small" color={colors.fg.tertiary} />
      </View>
    );
  }

  if (!data?.studio) return null;

  return (
    <StudioCard
      studio={data.studio}
      isFavorited={isFavorited}
      onToggleFavorite={onToggleFavorite}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  backButton: { padding: spacing.xs, marginRight: spacing.sm },
  headerTitle: { flex: 1, fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.fg.primary },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: typography.sizes.sm,
    color: colors.fg.tertiary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  primaryButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    backgroundColor: colors.button.primaryBg,
    borderRadius: radius.md,
  },
  primaryButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.button.primaryText,
  },
  list: { padding: spacing.md, paddingBottom: 100 },
  loadingItem: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
});
