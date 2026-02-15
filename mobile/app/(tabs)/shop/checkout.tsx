import { useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import WebView from 'react-native-webview';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing } from '@/theme';
import { useCartStore } from '@/stores/cartStore';

export default function CheckoutScreen() {
  const { url } = useLocalSearchParams<{ url: string }>();
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const clearCart = useCartStore((s) => s.clearCart);

  const handleNavigationChange = (navState: { url: string }) => {
    // Shopify redirects to a /thank_you or /thank-you page after successful checkout
    if (navState.url.includes('thank_you') || navState.url.includes('thank-you')) {
      clearCart();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
            <Path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 36 }} />
      </View>

      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.fg.primary} />
        </View>
      )}

      {url ? (
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          style={styles.webview}
          onLoadEnd={() => setLoading(false)}
          onNavigationStateChange={handleNavigationChange}
          sharedCookiesEnabled
          javaScriptEnabled
          domStorageEnabled
        />
      ) : (
        <View style={styles.error}>
          <Text style={styles.errorText}>No checkout URL available.</Text>
        </View>
      )}
    </SafeAreaView>
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
  closeButton: { padding: spacing.xs },
  headerTitle: {
    flex: 1,
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
    textAlign: 'center',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    top: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg.primary,
    zIndex: 1,
  },
  webview: { flex: 1 },
  error: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: typography.sizes.sm, color: colors.fg.muted },
});
