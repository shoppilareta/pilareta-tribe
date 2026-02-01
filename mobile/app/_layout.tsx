import { useState, useEffect, Component, type ReactNode } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, ActivityIndicator, Text, LogBox } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from '@/theme';
import { useAuthStore } from '@/stores/authStore';
import { hasCompletedOnboarding } from './onboarding';

// Keep splash visible while loading
SplashScreen.preventAutoHideAsync().catch(() => {});

// Suppress non-critical warnings in release
LogBox.ignoreLogs(['Require cycle']);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 2,
    },
  },
});

// Error boundary to prevent white-screen crashes
class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <View style={styles.loading}>
          <Text style={{ color: '#f6eddd', fontSize: 16, textAlign: 'center', padding: 20 }}>
            Something went wrong. Please restart the app.
          </Text>
          <Text style={{ color: '#888', fontSize: 12, textAlign: 'center', padding: 10 }}>
            {this.state.error.message}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function AppServices() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Defer service initialization to avoid blocking app startup
    const timer = setTimeout(() => setMounted(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return <DeferredServices />;
}

function DeferredServices() {
  const { useOfflineSync } = require('@/hooks/useOfflineSync');
  const { useNotifications } = require('@/hooks/useNotifications');
  const { useDeepLinks } = require('@/hooks/useDeepLinks');
  useOfflineSync();
  useNotifications();
  useDeepLinks();
  return null;
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const loadStoredAuth = useAuthStore((s) => s.loadStoredAuth);

  useEffect(() => {
    (async () => {
      try {
        const [, onboarded] = await Promise.all([
          loadStoredAuth(),
          hasCompletedOnboarding(),
        ]);
        setShowOnboarding(!onboarded);
      } catch {
        // Continue even if init fails
      } finally {
        setIsReady(true);
        SplashScreen.hideAsync().catch(() => {});
      }
    })();
  }, [loadStoredAuth]);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.fg.primary} />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.container}>
        <QueryClientProvider client={queryClient}>
          <AppServices />
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.bg.primary },
              animation: 'slide_from_right',
            }}
            initialRouteName={showOnboarding ? 'onboarding' : '(tabs)'}
          >
            <Stack.Screen name="onboarding" options={{ animation: 'none' }} />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="auth/login"
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
            <Stack.Screen
              name="auth/callback"
              options={{ presentation: 'transparentModal' }}
            />
            <Stack.Screen
              name="settings"
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
          </Stack>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  loading: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
