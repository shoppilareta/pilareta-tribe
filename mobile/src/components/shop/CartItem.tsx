import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';

interface CartLineItem {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    product: { title: string; images: { url: string }[] };
    price: { amount: string; currencyCode: string };
  };
}

interface CartItemProps {
  item: CartLineItem;
  onUpdateQuantity: (lineId: string, quantity: number) => void;
  onRemove: (lineId: string) => void;
}

function formatPrice(amount: string, currencyCode: string): string {
  const num = parseFloat(amount);
  if (currencyCode === 'INR') return `₹${num.toFixed(0)}`;
  return `${currencyCode} ${num.toFixed(2)}`;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const image = item.merchandise.product.images?.[0];
  const price = item.merchandise.price;
  const lineTotal = parseFloat(price.amount) * item.quantity;

  return (
    <View style={styles.container}>
      {image && (
        <Image source={{ uri: image.url }} style={styles.image} resizeMode="cover" />
      )}
      <View style={styles.info}>
        <Text style={styles.productTitle} numberOfLines={2}>{item.merchandise.product.title}</Text>
        {item.merchandise.title !== 'Default Title' && (
          <Text style={styles.variantTitle}>{item.merchandise.title}</Text>
        )}
        <Text style={styles.price}>{formatPrice(String(lineTotal), price.currencyCode)}</Text>

        <View style={styles.quantityRow}>
          <Pressable
            onPress={() => onUpdateQuantity(item.id, Math.max(0, item.quantity - 1))}
            style={styles.qtyButton}
          >
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
              <Path d="M5 12h14" strokeLinecap="round" />
            </Svg>
          </Pressable>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <Pressable
            onPress={() => onUpdateQuantity(item.id, item.quantity + 1)}
            style={styles.qtyButton}
          >
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
              <Path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </Svg>
          </Pressable>
        </View>
      </View>

      <Pressable onPress={() => onRemove(item.id)} style={styles.removeButton} hitSlop={8}>
        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.fg.tertiary} strokeWidth={1.5}>
          <Path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border.default },
  image: { width: 80, height: 80, borderRadius: radius.sm, backgroundColor: colors.cream05, marginRight: spacing.sm },
  info: { flex: 1 },
  productTitle: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: 2 },
  variantTitle: { fontSize: typography.sizes.sm, color: colors.fg.tertiary, marginBottom: 4 },
  price: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: spacing.sm },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  qtyButton: { width: 28, height: 28, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border.default, alignItems: 'center', justifyContent: 'center' },
  quantity: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.fg.primary, minWidth: 20, textAlign: 'center' },
  removeButton: { padding: spacing.xs },
});
