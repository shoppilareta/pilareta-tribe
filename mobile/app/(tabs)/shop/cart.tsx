import { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';
import { Button } from '@/components/ui';
import { CartItem } from '@/components/shop';
import { useCartStore } from '@/stores/cartStore';

function formatPrice(amount: string, currencyCode: string): string {
  const num = parseFloat(amount);
  if (currencyCode === 'INR') return `₹${num.toFixed(0)}`;
  return `${currencyCode} ${num.toFixed(2)}`;
}

export default function CartScreen() {
  const {
    lines,
    checkoutUrl,
    totalAmount,
    currencyCode,
    loading,
    loadCart,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCartStore();

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleUpdateQuantity = async (lineId: string, quantity: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateQuantity(lineId, quantity);
  };

  const handleRemove = async (lineId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await removeItem(lineId);
  };

  const handleCheckout = () => {
    if (checkoutUrl) {
      Linking.openURL(checkoutUrl);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeButton}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
            <Path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={styles.headerTitle}>Cart</Text>
        {lines.length > 0 && (
          <Pressable onPress={clearCart} style={styles.clearButton}>
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        )}
        {lines.length === 0 && <View style={{ width: 50 }} />}
      </View>

      {loading && lines.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.fg.primary} />
        </View>
      ) : lines.length === 0 ? (
        <View style={styles.centered}>
          <Svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke={colors.fg.muted} strokeWidth={1}>
            <Path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>Browse the shop to add items.</Text>
          <Pressable onPress={() => router.back()} style={styles.shopButton}>
            <Text style={styles.shopButtonText}>Browse Shop</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <FlatList
            data={lines}
            keyExtractor={(l) => l.id}
            renderItem={({ item }) => (
              <CartItem
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemove}
              />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />

          {/* Footer with total and checkout */}
          <View style={styles.footer}>
            {loading && (
              <ActivityIndicator color={colors.fg.primary} style={styles.footerLoader} />
            )}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>
                {totalAmount ? formatPrice(totalAmount, currencyCode) : '--'}
              </Text>
            </View>
            <Button
              title="Checkout"
              onPress={handleCheckout}
              disabled={!checkoutUrl || loading}
            />
            <Text style={styles.checkoutHint}>You'll be redirected to Shopify to complete your order.</Text>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  closeButton: { padding: spacing.xs },
  headerTitle: { flex: 1, fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.fg.primary, textAlign: 'center' },
  clearButton: { padding: spacing.xs },
  clearText: { fontSize: typography.sizes.sm, color: colors.fg.tertiary },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.sm },
  emptyTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginTop: spacing.md },
  emptyText: { fontSize: typography.sizes.sm, color: colors.fg.tertiary },
  shopButton: { marginTop: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: colors.fg.primary },
  shopButtonText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.bg.primary },
  list: { paddingHorizontal: spacing.md },
  footer: { padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border.default },
  footerLoader: { marginBottom: spacing.sm },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  totalLabel: { fontSize: typography.sizes.base, color: colors.fg.secondary },
  totalAmount: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.fg.primary },
  checkoutHint: { fontSize: 11, color: colors.fg.muted, textAlign: 'center', marginTop: spacing.sm },
});
