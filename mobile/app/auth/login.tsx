import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { colors, typography, spacing, radius } from '@/theme';
import { initiateLogin, exchangeCode } from '@/api/auth';
import { apiFetch, API_BASE } from '@/api/client';
import { useAuthStore } from '@/stores/authStore';
import Svg, { Path } from 'react-native-svg';

// Try to load Apple Authentication (iOS only)
let AppleAuthentication: typeof import('expo-apple-authentication') | null = null;
try {
  AppleAuthentication = require('expo-apple-authentication');
} catch {
  // Not available (Android or missing native module)
}

// Try to load AuthSession for Facebook
let AuthSession: typeof import('expo-auth-session') | null = null;
try {
  AuthSession = require('expo-auth-session');
} catch {
  // Not available
}

type LoadingButton = 'email' | 'apple' | 'facebook' | null;

function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message === 'Network request failed') return true;
  if (error && typeof error === 'object' && 'name' in error && (error as any).name === 'NetworkError') return true;
  return false;
}

export default function LoginScreen() {
  const [loading, setLoading] = useState<LoadingButton>(null);
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
    setLoading('email');
    clearError();
    try {
      const { authUrl, state, codeVerifier } = await initiateLogin();

      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        'pilareta://auth/callback'
      );

      if (result.type === 'cancel' || result.type === 'dismiss') {
        // User cancelled -- no error to show
        setLoading(null);
        return;
      }

      if (result.type !== 'success' || !result.url) {
        setErrorMessage('Sign in was cancelled. Please try again.');
        setLoading(null);
        return;
      }

      const url = new URL(result.url);
      const code = url.searchParams.get('code');
      const returnedState = url.searchParams.get('state');

      if (!code || returnedState !== state) {
        setErrorMessage('Authentication was cancelled or failed. Please try again.');
        setLoading(null);
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
      setLoading(null);
    }
  };

  // Apple Sign In (iOS only)
  const handleAppleLogin = async () => {
    if (!AppleAuthentication) return;
    setLoading('apple');
    clearError();
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        ],
      });

      if (!credential.identityToken) {
        setErrorMessage('Could not get Apple identity token. Please try again.');
        setLoading(null);
        return;
      }

      const response = await fetch(`${API_BASE}/api/auth/mobile/apple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identityToken: credential.identityToken,
          email: credential.email,
          firstName: credential.fullName?.givenName,
          lastName: credential.fullName?.familyName,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Apple sign in failed');
      }

      const { accessToken, refreshToken, user, expiresAt } = await response.json();
      await setTokens(accessToken, refreshToken, expiresAt);
      await setUser(user);
      navigateAfterLogin();
    } catch (error: any) {
      if (error?.code === 'ERR_REQUEST_CANCELED' || error?.code === 'ERR_CANCELED') {
        // User cancelled Apple auth -- no error to show
      } else if (isNetworkError(error)) {
        setErrorMessage('No internet connection. Please check your network and try again.');
      } else {
        setErrorMessage('Apple sign in failed. Please try again.');
      }
    } finally {
      setLoading(null);
    }
  };

  // Facebook Sign In
  const handleFacebookLogin = async () => {
    setLoading('facebook');
    clearError();
    try {
      const result = await WebBrowser.openAuthSessionAsync(
        `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || ''}&redirect_uri=${encodeURIComponent('pilareta://auth/callback')}&scope=email,public_profile&response_type=token`,
        'pilareta://auth/callback'
      );

      if (result.type === 'cancel' || result.type === 'dismiss') {
        setLoading(null);
        return;
      }

      if (result.type !== 'success' || !result.url) {
        setErrorMessage('Facebook sign in was cancelled. Please try again.');
        setLoading(null);
        return;
      }

      // Extract access token from fragment
      const fragment = result.url.split('#')[1] || '';
      const params = new URLSearchParams(fragment);
      const fbToken = params.get('access_token');

      if (!fbToken) {
        setErrorMessage('Could not get Facebook access token. Please try again.');
        setLoading(null);
        return;
      }

      const response = await fetch(`${API_BASE}/api/auth/mobile/facebook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: fbToken,
          platform: Platform.OS,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Facebook sign in failed');
      }

      const { accessToken, refreshToken, user, expiresAt } = await response.json();
      await setTokens(accessToken, refreshToken, expiresAt);
      await setUser(user);
      navigateAfterLogin();
    } catch (error) {
      if (isNetworkError(error)) {
        setErrorMessage('No internet connection. Please check your network and try again.');
      } else {
        setErrorMessage('Facebook sign in failed. Please try again.');
      }
    } finally {
      setLoading(null);
    }
  };

  const handleSkip = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)/shop');
    }
  };

  const isLoading = loading !== null;
  const showApple = Platform.OS === 'ios' && AppleAuthentication != null;

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

        {/* Email login */}
        <Pressable
          style={[styles.loginButton, loading === 'email' && styles.loginButtonActive, isLoading && loading !== 'email' && styles.loginButtonDisabled]}
          onPress={handleEmailLogin}
          disabled={isLoading}
        >
          {loading === 'email' ? (
            <ActivityIndicator color={colors.button.primaryText} />
          ) : (
            <Text style={styles.loginButtonText}>Sign in with email</Text>
          )}
        </Pressable>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Apple Sign In (iOS only) */}
        {showApple && (
          <Pressable
            style={[styles.socialButton, styles.appleButton, loading === 'apple' && styles.socialButtonActive, isLoading && loading !== 'apple' && styles.loginButtonDisabled]}
            onPress={handleAppleLogin}
            disabled={isLoading}
          >
            {loading === 'apple' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="#fff">
                  <Path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </Svg>
                <Text style={[styles.socialButtonText, { color: '#fff' }]}>Sign in with Apple</Text>
              </>
            )}
          </Pressable>
        )}

        {/* Facebook Sign In */}
        <Pressable
          style={[styles.socialButton, styles.facebookButton, loading === 'facebook' && styles.socialButtonActive, isLoading && loading !== 'facebook' && styles.loginButtonDisabled]}
          onPress={handleFacebookLogin}
          disabled={isLoading}
        >
          {loading === 'facebook' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="#fff">
                <Path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </Svg>
              <Text style={[styles.socialButtonText, { color: '#fff' }]}>Sign in with Facebook</Text>
            </>
          )}
        </Pressable>

        <Pressable style={styles.skipButton} onPress={handleSkip} disabled={isLoading}>
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
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.button.primaryText,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border.default,
  },
  dividerText: {
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.sm,
    color: colors.fg.tertiary,
  },
  socialButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: radius.md,
    paddingVertical: 16,
    marginBottom: spacing.sm,
  },
  socialButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  socialButtonActive: {
    opacity: 0.9,
  },
  appleButton: {
    backgroundColor: '#000',
  },
  facebookButton: {
    backgroundColor: '#1877F2',
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
