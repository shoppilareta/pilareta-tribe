import { View, Text, StyleSheet, Image, Pressable, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';
import { formatPrice } from '@/utils/formatPrice';

interface CartLineItem {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    image?: { url: string; altText?: string | null };
    product: { title: string; handle: string };
    price: { amount: string; currencyCode: string };
  };
}

interface CartItemProps {
  item: CartLineItem;
  onUpdateQuantity: (lineId: string, quantity: number) => void;
  onRemove: (lineId: string) => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const image = item.merchandise?.image;
  const price = item.merchandise?.price ?? { amount: '0', currencyCode: 'INR' };
  const lineTotal = parseFloat(price.amount) * item.quantity;

  return (
    <View style={styles.container} accessibilityLabel={`${item.merchandise?.product?.title ?? 'Product'}, quantity ${item.quantity}`}>
      {image ? (
        <Image source={{ uri: image.url }} style={styles.image} resizeMode="cover" accessibilityIgnoresInvertColors />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder]}>
          <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.fg.muted} strokeWidth={1.5}>
            <Path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.productTitle} numberOfLines={2}>{item.merchandise?.product?.title ?? 'Product'}</Text>
        {item.merchandise?.title && item.merchandise.title !== 'Default Title' && (
          <Text style={styles.variantTitle} numberOfLines={1}>{item.merchandise.title}</Text>
        )}
        <Text style={styles.price}>{formatPrice(String(lineTotal), price.currencyCode)}</Text>

        <View style={styles.quantityRow}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onUpdateQuantity(item.id, Math.max(1, item.quantity - 1));
            }}
            style={[styles.qtyButton, item.quantity <= 1 && { opacity: 0.3 }]}
            disabled={item.quantity <= 1}
            accessibilityLabel="Decrease quantity"
            accessibilityRole="button"
            accessibilityState={{ disabled: item.quantity <= 1 }}
          >
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
              <Path d="M5 12h14" strokeLinecap="round" />
            </Svg>
          </Pressable>
          <Text style={styles.quantity} accessibilityLabel={`Quantity: ${item.quantity}`}>{item.quantity}</Text>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onUpdateQuantity(item.id, item.quantity + 1);
            }}
            style={styles.qtyButton}
            accessibilityLabel="Increase quantity"
            accessibilityRole="button"
          >
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
              <Path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </Svg>
          </Pressable>
        </View>
      </View>

      <Pressable onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          Alert.alert('Remove Item', `Remove ${item.merchandise?.product?.title ?? 'this item'}?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Remove', style: 'destructive', onPress: () => onRemove(item.id) },
          ]);
        }} style={styles.removeButton} hitSlop={8} accessibilityLabel="Remove item" accessibilityRole="button">
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.fg.tertiary} strokeWidth={1.5}>
          <Path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border.default },
  image: { width: 80, height: 80, borderRadius: radius.sm, backgroundColor: colors.cream05, marginRight: spacing.sm, overflow: 'hidden' as const },
  imagePlaceholder: { alignItems: 'center' as const, justifyContent: 'center' as const },
  info: { flex: 1 },
  productTitle: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: 2 },
  variantTitle: { fontSize: typography.sizes.sm, color: colors.fg.tertiary, marginBottom: 4 },
  price: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: spacing.sm },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  qtyButton: { width: 28, height: 28, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border.default, alignItems: 'center', justifyContent: 'center' },
  quantity: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.fg.primary, minWidth: 20, textAlign: 'center' },
  removeButton: { padding: spacing.xs },
});
