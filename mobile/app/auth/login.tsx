import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { colors, typography, spacing, radius } from '@/theme';
import { initiateLogin, exchangeCode } from '@/api/auth';
import { useAuthStore } from '@/stores/authStore';

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const { setTokens, setUser } = useAuthStore();

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Step 1: Get auth URL and PKCE params from server
      const { authUrl, state, codeVerifier } = await initiateLogin();

      // Step 2: Open Shopify login in system browser
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        'pilareta://auth/callback'
      );

      if (result.type !== 'success' || !result.url) {
        setLoading(false);
        return;
      }

      // Step 3: Extract authorization code from callback URL
      const url = new URL(result.url);
      const code = url.searchParams.get('code');
      const returnedState = url.searchParams.get('state');

      if (!code || returnedState !== state) {
        Alert.alert('Sign In Failed', 'Authentication was cancelled or failed. Please try again.');
        setLoading(false);
        return;
      }

      // Step 4: Exchange code for tokens
      const { accessToken, refreshToken, user, expiresAt } = await exchangeCode({
        code,
        state,
        codeVerifier,
      });

      // Step 5: Store tokens and user data
      await setTokens(accessToken, refreshToken, expiresAt);
      await setUser(user);

      // Step 6: Navigate back
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)/track');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Sign In Failed', 'Something went wrong. Please try again.');
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

        <Pressable
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
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
  loginButton: {
    width: '100%',
    backgroundColor: colors.button.primaryBg,
    borderRadius: radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  loginButtonDisabled: {
    opacity: 0.7,
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
