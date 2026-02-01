import { useState, useEffect, Component, type ReactNode } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, LogBox, ScrollView } from 'react-native';

// Track which modules loaded successfully
const loadLog: string[] = [];
const loadError: string[] = [];

function tryLoad<T>(name: string, loader: () => T): T | null {
  try {
    const mod = loader();
    loadLog.push(name);
    return mod;
  } catch (e: any) {
    loadError.push(`${name}: ${e?.message || String(e)}`);
    return null;
  }
}

// Load each module with error tracking
const ExpoRouter = tryLoad('expo-router', () => require('expo-router'));
const ExpoStatusBar = tryLoad('expo-status-bar', () => require('expo-status-bar'));
const ReactQuery = tryLoad('@tanstack/react-query', () => require('@tanstack/react-query'));
const GestureHandler = tryLoad('react-native-gesture-handler', () => require('react-native-gesture-handler'));
const SplashScreenMod = tryLoad('expo-splash-screen', () => require('expo-splash-screen'));
const ThemeMod = tryLoad('@/theme', () => require('@/theme'));
const AuthStoreMod = tryLoad('@/stores/authStore', () => require('@/stores/authStore'));

// Don't import onboarding screen directly - it pulls in too many deps
// Instead, inline the check
const SecureStoreMod = tryLoad('expo-secure-store', () => require('expo-secure-store'));

const ONBOARDING_KEY = 'pilareta_onboarding_complete';
async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    if (!SecureStoreMod) return true;
    const val = await SecureStoreMod.getItemAsync(ONBOARDING_KEY);
    return val === 'true';
  } catch {
    return true;
  }
}

// Safe references
const Stack = ExpoRouter?.Stack;
const StatusBar = ExpoStatusBar?.StatusBar;
const QueryClient = ReactQuery?.QueryClient;
const QueryClientProvider = ReactQuery?.QueryClientProvider;
const GestureHandlerRootView = GestureHandler?.GestureHandlerRootView;
const colors = ThemeMod?.colors ?? { bg: { primary: '#202219' }, fg: { primary: '#f6eddd' } };
const useAuthStore = AuthStoreMod?.useAuthStore;

// Keep splash visible while loading
try {
  SplashScreenMod?.preventAutoHideAsync();
} catch {}

// Suppress non-critical warnings
LogBox.ignoreLogs(['Require cycle']);

let queryClient: any = null;
try {
  if (QueryClient) {
    queryClient = new QueryClient({
      defaultOptions: { queries: { staleTime: 1000 * 60 * 2, retry: 2 } },
    });
  }
} catch (e: any) {
  loadError.push(`QueryClient init: ${e?.message}`);
}

// Error boundary
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
    const timer = setTimeout(() => setMounted(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;
  return <DeferredServices />;
}

function DeferredServices() {
  try {
    const { useOfflineSync } = require('@/hooks/useOfflineSync');
    const { useNotifications } = require('@/hooks/useNotifications');
    const { useDeepLinks } = require('@/hooks/useDeepLinks');
    useOfflineSync();
    useNotifications();
    useDeepLinks();
  } catch {}
  return null;
}

// Show load errors if any occurred
function DiagnosticOverlay() {
  if (loadError.length === 0) return null;
  return (
    <View style={{ position: 'absolute', top: 50, left: 10, right: 10, backgroundColor: '#ff000088', borderRadius: 8, padding: 12, zIndex: 9999 }}>
      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14, marginBottom: 6 }}>Module Load Errors:</Text>
      {loadError.map((err, i) => (
        <Text key={i} style={{ color: '#fff', fontSize: 11, marginBottom: 2 }}>{err}</Text>
      ))}
    </View>
  );
}

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const loadStoredAuth = useAuthStore ? useAuthStore((s: any) => s.loadStoredAuth) : null;

  useEffect(() => {
    (async () => {
      try {
        const promises: Promise<any>[] = [];
        if (loadStoredAuth) promises.push(loadStoredAuth());
        promises.push(hasCompletedOnboarding().then(done => setShowOnboarding(!done)));
        await Promise.all(promises);
      } catch {
        // Continue even if init fails
      } finally {
        setIsReady(true);
        try { SplashScreenMod?.hideAsync(); } catch {}
      }
    })();
  }, [loadStoredAuth]);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.fg.primary} />
        <DiagnosticOverlay />
      </View>
    );
  }

  // Build the component tree based on what loaded successfully
  let content = Stack ? (
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
      <Stack.Screen name="auth/login" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
      <Stack.Screen name="auth/callback" options={{ presentation: 'transparentModal' }} />
      <Stack.Screen name="settings" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
    </Stack>
  ) : (
    <View style={styles.loading}>
      <Text style={{ color: '#f6eddd' }}>Router failed to load</Text>
    </View>
  );

  if (StatusBar) {
    content = <>{content}<StatusBar style="light" /></>;
  }

  content = <><AppServices />{content}<DiagnosticOverlay /></>;

  if (queryClient && QueryClientProvider) {
    content = <QueryClientProvider client={queryClient}>{content}</QueryClientProvider>;
  }

  if (GestureHandlerRootView) {
    content = <GestureHandlerRootView style={styles.container}>{content}</GestureHandlerRootView>;
  } else {
    content = <View style={styles.container}>{content}</View>;
  }

  return <ErrorBoundary>{content}</ErrorBoundary>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#202219',
  },
  loading: {
    flex: 1,
    backgroundColor: '#202219',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
