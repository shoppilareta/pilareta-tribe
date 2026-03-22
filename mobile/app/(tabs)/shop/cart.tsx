import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';
import { Button, CartSkeleton } from '@/components/ui';
import { CartItem } from '@/components/shop';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/components/ui/Toast';
import { formatPrice } from '@/utils/formatPrice';

export default function CartScreen() {
  const {
    lines,
    checkoutUrl,
    totalAmount,
    subtotalAmount,
    taxAmount,
    currencyCode,
    loading,
    loadCart,
    updateQuantity,
    removeItem,
    clearCart,
    cartExpired,
    clearExpired,
    discountCode,
    discountAmount,
    applyDiscount: applyDiscountAction,
    removeDiscount,
  } = useCartStore();
  const { showToast } = useToast();
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState('');

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  useEffect(() => {
    if (cartExpired) {
      showToast('Your cart has expired. Please add items again.', 'info');
      clearExpired();
    }
  }, [cartExpired, clearExpired, showToast]);

  const handleUpdateQuantity = async (lineId: string, quantity: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await updateQuantity(lineId, quantity);
      showToast('Cart updated');
    } catch {
      showToast('Failed to update cart. Please try again.', 'error');
      loadCart(); // Refresh cart from server to get correct state
    }
  };

  const handleRemove = async (lineId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await removeItem(lineId);
      showToast('Removed from cart');
    } catch {
      showToast('Failed to remove item. Please try again.', 'error');
      loadCart(); // Refresh cart from server to get correct state
    }
  };

  const handleApplyDiscount = async () => {
    setPromoError('');
    try {
      await applyDiscountAction(promoCode.trim());
      setPromoCode('');
      showToast('Discount applied!');
    } catch (err: any) {
      const message = err?.data?.error || (err instanceof Error ? err.message : 'Invalid promo code');
      setPromoError(message);
    }
  };

  const handleRemoveDiscount = async () => {
    await removeDiscount();
    showToast('Discount removed');
  };

  const handleCheckout = () => {
    if (checkoutUrl) {
      router.push({ pathname: '/(tabs)/shop/checkout', params: { url: checkoutUrl } });
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
          <Pressable onPress={() => Alert.alert('Clear Cart', 'Remove all items from your cart?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Clear', style: 'destructive', onPress: clearCart }])} style={styles.clearButton}>
            <Text style={styles.clearText}>Clear</Text>
          </Pressable>
        )}
        {lines.length === 0 && <View style={{ width: 50 }} />}
      </View>

      {loading && lines.length === 0 ? (
        <CartSkeleton />
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

            {/* Promo Code */}
            <View style={styles.promoSection}>
              {discountCode ? (
                <View style={styles.promoApplied}>
                  <Text style={styles.promoAppliedText}>
                    Code "{discountCode}" applied
                  </Text>
                  <Pressable onPress={handleRemoveDiscount}>
                    <Text style={styles.promoRemove}>Remove</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.promoInput}>
                  <TextInput
                    style={styles.promoTextInput}
                    placeholder="Promo code"
                    placeholderTextColor={colors.fg.muted}
                    value={promoCode}
                    onChangeText={setPromoCode}
                    autoCapitalize="characters"
                  />
                  <Pressable
                    style={[styles.promoButton, !promoCode.trim() && { opacity: 0.5 }]}
                    onPress={handleApplyDiscount}
                    disabled={!promoCode.trim() || loading}
                  >
                    <Text style={styles.promoButtonText}>Apply</Text>
                  </Pressable>
                </View>
              )}
              {promoError ? <Text style={styles.promoError}>{promoError}</Text> : null}
            </View>

            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Subtotal</Text>
              <Text style={styles.costValue}>
                {subtotalAmount ? formatPrice(subtotalAmount, currencyCode) : '--'}
              </Text>
            </View>
            {discountAmount && parseFloat(discountAmount) > 0 && (
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Discount</Text>
                <Text style={[styles.costValue, { color: colors.success }]}>-{formatPrice(discountAmount, currencyCode)}</Text>
              </View>
            )}
            {taxAmount && parseFloat(taxAmount) > 0 && (
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Tax</Text>
                <Text style={styles.costValue}>
                  {formatPrice(taxAmount, currencyCode)}
                </Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>
                {totalAmount ? formatPrice(totalAmount, currencyCode) : '--'}
              </Text>
            </View>
            <View style={styles.shippingBanner}>
              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.success} strokeWidth={2}>
                <Path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
              <Text style={styles.shippingBannerText}>Free shipping on all orders!</Text>
            </View>
            <Button
              title="Checkout"
              onPress={handleCheckout}
              disabled={!checkoutUrl || loading}
            />
            <Text style={styles.checkoutHint}>Shipping & payment will open securely in-app.</Text>
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
  costRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  costLabel: { fontSize: typography.sizes.sm, color: colors.fg.tertiary },
  costValue: { fontSize: typography.sizes.sm, color: colors.fg.secondary },
  divider: { height: 1, backgroundColor: colors.border.default, marginVertical: spacing.sm },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  totalLabel: { fontSize: typography.sizes.base, fontWeight: typography.weights.bold, color: colors.fg.primary },
  totalAmount: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colors.fg.primary },
  checkoutHint: { fontSize: 11, color: colors.fg.muted, textAlign: 'center', marginTop: spacing.sm },
  shippingBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: radius.sm, paddingVertical: spacing.sm, marginBottom: spacing.sm },
  shippingBannerText: { fontSize: typography.sizes.xs, fontWeight: typography.weights.medium, color: colors.success },
  promoSection: { marginBottom: spacing.sm },
  promoApplied: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm },
  promoAppliedText: { fontSize: typography.sizes.sm, color: colors.success, fontWeight: typography.weights.medium },
  promoRemove: { fontSize: typography.sizes.sm, color: colors.error, fontWeight: typography.weights.medium },
  promoInput: { flexDirection: 'row', gap: spacing.sm },
  promoTextInput: { flex: 1, borderWidth: 1, borderColor: colors.border.default, borderRadius: radius.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, fontSize: typography.sizes.sm, color: colors.fg.primary },
  promoButton: { backgroundColor: colors.fg.primary, borderRadius: radius.sm, paddingHorizontal: spacing.md, justifyContent: 'center', alignItems: 'center' },
  promoButtonText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.bg.primary },
  promoError: { fontSize: typography.sizes.xs, color: colors.error, marginTop: spacing.xs },
});
