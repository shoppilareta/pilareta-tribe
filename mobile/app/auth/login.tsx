import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { colors, typography, spacing, radius } from '@/theme';
import { initiateLogin, exchangeCode } from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';

function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message === 'Network request failed') return true;
  if (error && typeof error === 'object' && 'name' in error && (error as any).name === 'NetworkError') return true;
  return false;
}

export default function LoginScreen() {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { setTokens, setUser } = useAuthStore();

  const navigateAfterLogin = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/track');
    }
  };

  const clearError = () => setErrorMessage(null);

  // Email login (Shopify OAuth)
  const handleEmailLogin = async () => {
    setLoading(true);
    clearError();
    try {
      const { authUrl, state, codeVerifier } = await initiateLogin();

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        'pilareta://auth/callback'
      );

      if (result.type === 'cancel' || result.type === 'dismiss') {
        // User cancelled -- no error to show
        setLoading(false);
        return;
      }

      if (result.type !== 'success' || !result.url) {
        setErrorMessage('Sign in was cancelled. Please try again.');
        setLoading(false);
        return;
      }

      const url = new URL(result.url);
      const code = url.searchParams.get('code');
      const returnedState = url.searchParams.get('state');

      if (!code || returnedState !== state) {
        setErrorMessage('Authentication was cancelled or failed. Please try again.');
        setLoading(false);
        return;
      }

      const { accessToken, refreshToken, user, expiresAt } = await exchangeCode({
        code,
        state,
        codeVerifier,
      });

      await setTokens(accessToken, refreshToken, expiresAt);
      await setUser(user);
      navigateAfterLogin();
    } catch (error) {
      if (isNetworkError(error)) {
        setErrorMessage('No internet connection. Please check your network and try again.');
      } else {
        setErrorMessage('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/shop');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.brand}>PILARETA TRIBE</Text>
        <Text style={styles.tagline}>Your Pilates community</Text>

        <View style={styles.spacer} />

        <Text style={styles.loginPrompt}>
          Sign in to track workouts, build streaks, and connect with the community.
        </Text>

        {/* Error message display */}
        {errorMessage && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Email login (Shopify OAuth) */}
        <Pressable
          style={[styles.loginButton, loading && styles.loginButtonActive]}
          onPress={handleEmailLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.button.primaryText} />
          ) : (
            <Text style={styles.loginButtonText}>Sign in with email</Text>
          )}
        </Pressable>

        <Pressable style={styles.skipButton} onPress={handleSkip} disabled={loading}>
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
  errorContainer: {
    width: '100%',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: typography.sizes.sm,
    color: '#ef4444',
    textAlign: 'center',
    lineHeight: 20,
  },
  loginButton: {
    width: '100%',
    backgroundColor: colors.button.primaryBg,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  loginButtonActive: {
    opacity: 0.9,
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
    marginTop: spacing.sm,
  },
  skipButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.fg.secondary,
  },
});
