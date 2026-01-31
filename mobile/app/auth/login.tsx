import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius } from '@/theme';

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.brand}>PILARETA TRIBE</Text>
        <Text style={styles.tagline}>Your Pilates community</Text>

        <View style={styles.spacer} />

        <Text style={styles.loginPrompt}>
          Sign in to track workouts, build streaks, and connect with the community.
        </Text>

        <Pressable style={styles.loginButton}>
          <Text style={styles.loginButtonText}>Sign In with Shopify</Text>
        </Pressable>

        <Pressable style={styles.skipButton}>
          <Text style={styles.skipButtonText}>Continue as Guest</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontSize: typography.sizes['3xl'],
    fontWeight: typography.weights.bold,
    color: colors.fg.primary,
    letterSpacing: 4,
    marginBottom: spacing.sm,
  },
  tagline: {
    fontSize: typography.sizes.md,
    color: colors.fg.secondary,
  },
  spacer: {
    height: 80,
  },
  loginPrompt: {
    fontSize: typography.sizes.base,
    color: colors.fg.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  loginButton: {
    width: '100%',
    backgroundColor: colors.button.primaryBg,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  loginButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.button.primaryText,
  },
  skipButton: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border.hover,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.fg.secondary,
  },
});
