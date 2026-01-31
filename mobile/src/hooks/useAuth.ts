import { useCallback, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { initiateLogin, exchangeCode, logoutMobile } from '@/api/auth';

WebBrowser.maybeCompleteAuthSession();

export function useAuth() {
  const { user, isAuthenticated, isLoading, accessToken, loadStoredAuth, setTokens, setUser, logout: clearAuth } = useAuthStore();

  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);

  const login = useCallback(async () => {
    try {
      // 1. Get auth URL and PKCE params from server
      const { authUrl, state, codeVerifier } = await initiateLogin();

      // 2. Open Shopify login in system browser
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        'pilareta://auth/callback'
      );

      if (result.type !== 'success' || !result.url) {
        return { success: false, error: 'Login cancelled' };
      }

      // 3. Extract code and state from redirect URL
      const url = new URL(result.url);
      const code = url.searchParams.get('code');
      const returnedState = url.searchParams.get('state');

      if (!code) {
        const error = url.searchParams.get('error_description') || 'No authorization code received';
        return { success: false, error };
      }

      // 4. Verify state matches
      if (returnedState !== state) {
        return { success: false, error: 'State mismatch - possible CSRF attack' };
      }

      // 5. Exchange code for tokens
      const response = await exchangeCode({ code, state, codeVerifier });

      // 6. Store tokens and user data
      await setTokens(response.accessToken, response.refreshToken, response.expiresAt);
      setUser(response.user);

      // 7. Navigate to Track dashboard
      router.replace('/(tabs)/track');

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  }, [setTokens, setUser]);

  const logout = useCallback(async () => {
    try {
      if (accessToken) {
        const result = await logoutMobile(accessToken);
        // Optionally open Shopify logout URL to clear their session
        if (result.logoutUrl) {
          await WebBrowser.openBrowserAsync(result.logoutUrl);
        }
      }
    } catch {
      // Server logout failed - still clear local state
    } finally {
      await clearAuth();
      router.replace('/(tabs)/track');
    }
  }, [accessToken, clearAuth]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };
}
