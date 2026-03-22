import { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { colors, typography, spacing, radius } from '@/theme';

export default function AuthCallback() {
  const params = useLocalSearchParams<{ code?: string; state?: string; error?: string }>();
  const [showRetry, setShowRetry] = useState(false);

  const hasParams = !!(params.code || params.state);

  useEffect(() => {
    // OAuth callback handling will be implemented in Task #5
    // For now, just redirect to track
    const timer = setTimeout(() => {
      router.replace('/(tabs)/track');
    }, 2000);

    const retryTimer = setTimeout(() => {
      setShowRetry(true);
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearTimeout(retryTimer);
    };
  }, [params]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.fg.primary} />
      <Text style={styles.text}>
        {hasParams ? 'Processing...' : 'Signing you in...'}
      </Text>
      {showRetry && (
        <View style={styles.retryContainer}>
          <Text style={styles.retryText}>
            Taking longer than expected. Try signing in again.
          </Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => router.replace('/auth/login')}
          >
            <Text style={styles.retryButtonText}>Back to Login</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: 16,
    fontSize: typography.sizes.md,
    color: colors.fg.secondary,
  },
  retryContainer: {
    marginTop: spacing.xl,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  retryText: {
    fontSize: typography.sizes.sm,
    color: colors.fg.tertiary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.fg.primary,
  },
  retryButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.bg.primary,
  },
});
