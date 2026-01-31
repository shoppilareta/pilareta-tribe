import { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Dimensions,
  type ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ONBOARDING_KEY = 'pilareta_onboarding_complete';

interface OnboardingPage {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
}

const PAGES: OnboardingPage[] = [
  {
    id: 'welcome',
    icon: (
      <View style={pageStyles.iconContainer}>
        <Text style={pageStyles.brandText}>P</Text>
      </View>
    ),
    title: 'Welcome to\nPilareta Tribe',
    subtitle: 'Your Pilates journey starts here',
    description:
      'Track workouts, learn exercises, connect with your community, and find studios near you.',
  },
  {
    id: 'track',
    icon: (
      <View style={[pageStyles.iconCircle, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
        <Svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth={2}>
          <Path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </Svg>
      </View>
    ),
    title: 'Track Your\nProgress',
    subtitle: 'Log workouts in seconds',
    description:
      'Quick 10-second logging. Build streaks, track duration and intensity, and share beautiful recap cards.',
  },
  {
    id: 'learn',
    icon: (
      <View style={[pageStyles.iconCircle, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
        <Svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth={2}>
          <Path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <Path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </Svg>
      </View>
    ),
    title: 'Learn &\nConnect',
    subtitle: 'Grow with the community',
    description:
      'Explore exercises and programs, share your journey with the community, and discover studios nearby.',
  },
  {
    id: 'start',
    icon: (
      <View style={[pageStyles.iconCircle, { backgroundColor: 'rgba(249, 115, 22, 0.15)' }]}>
        <Svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth={2}>
          <Path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </View>
    ),
    title: "Let's Get\nStarted",
    subtitle: 'Your mat is ready',
    description:
      'Sign in to sync your data across devices, or explore the app first. You can always sign in later.',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < PAGES.length - 1) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  const handleComplete = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
    router.replace('/(tabs)/track');
  };

  const handleSkip = async () => {
    await SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
    router.replace('/(tabs)/track');
  };

  const isLastPage = currentIndex === PAGES.length - 1;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Skip button */}
      <View style={styles.topBar}>
        {!isLastPage ? (
          <Pressable
            onPress={handleSkip}
            style={styles.skipButton}
            accessibilityLabel="Skip onboarding"
            accessibilityRole="button"
          >
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        ) : (
          <View style={{ width: 60 }} />
        )}
      </View>

      {/* Pages */}
      <FlatList
        ref={flatListRef}
        data={PAGES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        renderItem={({ item }) => (
          <View style={styles.page} accessibilityRole="summary">
            <View style={styles.pageContent}>
              <View style={styles.iconWrapper}>{item.icon}</View>
              <Text
                style={styles.pageTitle}
                accessibilityRole="header"
              >
                {item.title}
              </Text>
              <Text style={styles.pageSubtitle}>{item.subtitle}</Text>
              <Text style={styles.pageDescription}>{item.description}</Text>
            </View>
          </View>
        )}
      />

      {/* Bottom controls */}
      <View style={styles.bottomBar}>
        {/* Pagination dots */}
        <View style={styles.pagination} accessibilityLabel={`Page ${currentIndex + 1} of ${PAGES.length}`}>
          {PAGES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentIndex && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Action button */}
        {isLastPage ? (
          <View style={styles.lastPageActions}>
            <Pressable
              style={styles.primaryButton}
              onPress={handleComplete}
              accessibilityLabel="Get started with Pilareta Tribe"
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={styles.nextButton}
            onPress={handleNext}
            accessibilityLabel="Next page"
            accessibilityRole="button"
          >
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
              <Path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

/** Check if onboarding has been completed */
export async function hasCompletedOnboarding(): Promise<boolean> {
  const value = await SecureStore.getItemAsync(ONBOARDING_KEY);
  return value === 'true';
}

const pageStyles = StyleSheet.create({
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.cream10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.fg.primary,
    letterSpacing: 2,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  skipButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  skipText: {
    fontSize: typography.sizes.base,
    color: colors.fg.tertiary,
  },
  page: {
    width: SCREEN_WIDTH,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  pageContent: {
    alignItems: 'center',
  },
  iconWrapper: {
    marginBottom: spacing['2xl'],
  },
  pageTitle: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.fg.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    lineHeight: 44,
  },
  pageSubtitle: {
    fontSize: typography.sizes.md,
    color: colors.fg.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  pageDescription: {
    fontSize: typography.sizes.base,
    color: colors.fg.tertiary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  bottomBar: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    alignItems: 'center',
    gap: spacing.lg,
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border.default,
  },
  dotActive: {
    backgroundColor: colors.fg.primary,
    width: 24,
  },
  nextButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.cream10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  lastPageActions: {
    width: '100%',
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: colors.button.primaryBg,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.button.primaryText,
  },
});
