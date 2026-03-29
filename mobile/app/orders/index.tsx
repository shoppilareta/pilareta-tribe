import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';
import { getOrders, type ShopifyOrder } from '@/api/orders';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/components/ui/Toast';
import { formatPrice } from '@/utils/formatPrice';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'paid': case 'fulfilled': return 'rgba(34, 197, 94, 0.8)';
    case 'unfulfilled': case 'partially_fulfilled': return 'rgba(234, 179, 8, 0.8)';
    case 'refunded': case 'cancelled': return 'rgba(239, 68, 68, 0.8)';
    default: return colors.fg.tertiary;
  }
}

function OrderCard({ order, onReorder }: { order: ShopifyOrder; onReorder: (order: ShopifyOrder) => void }) {
  const displayStatus = order.cancelledAt ? 'Cancelled' : (order.fulfillmentStatus || order.financialStatus || 'Processing').replace(/_/g, ' ');
  const trackingInfo = order.fulfillments.flatMap(f => f.trackingInfo);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.orderName}>Order {order.name}</Text>
          <Text style={styles.orderDate}>{formatDate(order.processedAt)}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={styles.orderTotal}>{formatPrice(order.totalPrice.amount, order.totalPrice.currencyCode)}</Text>
          <Text style={[styles.statusBadge, { color: getStatusColor(displayStatus) }]}>{displayStatus}</Text>
        </View>
      </View>

      {order.lineItems.nodes.map((item, idx) => (
        <View key={idx} style={styles.lineItem}>
          {item.image && (
            <Image source={{ uri: item.image.url }} style={styles.lineItemImage} />
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.lineItemTitle} numberOfLines={1}>{item.title}</Text>
            {item.variantTitle && <Text style={styles.lineItemVariant}>{item.variantTitle}</Text>}
          </View>
          <Text style={styles.lineItemQty}>x{item.quantity}</Text>
        </View>
      ))}

      {trackingInfo.length > 0 && trackingInfo[0].url && (
        <Pressable onPress={() => Linking.openURL(trackingInfo[0].url)} style={styles.trackButton}>
          <Text style={styles.trackButtonText}>Track shipment</Text>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth={2}>
            <Path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
      )}

      <Pressable style={styles.reorderButton} onPress={() => onReorder(order)}>
        <Text style={styles.reorderText}>Buy Again</Text>
      </Pressable>
    </View>
  );
}

export default function OrdersScreen() {
  const isAuthenticated = !!useAuthStore((s) => s.accessToken);
  const { addItem } = useCartStore();
  const { showToast } = useToast();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
    enabled: isAuthenticated,
  });

  const orders = data?.orders ?? [];
  const apiError = data?.error;

  const handleReorder = async (order: ShopifyOrder) => {
    let added = 0;
    let failed = 0;
    for (const item of order.lineItems.nodes) {
      if (item.variant?.id) {
        try {
          await addItem(item.variant.id, item.quantity);
          added++;
        } catch {
          failed++;
        }
      } else {
        failed++;
      }
    }

    if (added > 0 && failed === 0) {
      showToast(`${added} item${added > 1 ? 's' : ''} added to cart`);
    } else if (added > 0 && failed > 0) {
      showToast(`${added} item${added > 1 ? 's' : ''} added (${failed} unavailable)`, 'info');
    } else {
      showToast('Items are no longer available', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
            <Path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
        <Text style={styles.title}>Your Orders</Text>
        <View style={{ width: 22 }} />
      </View>

      {!isAuthenticated ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>Sign in to view orders</Text>
          <Text style={styles.emptyText}>Your order history will appear here after you sign in.</Text>
          <Pressable onPress={() => router.push('/auth/login')} style={styles.retryButton}>
            <Text style={styles.retryText}>Sign In</Text>
          </Pressable>
        </View>
      ) : isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.fg.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>Unable to load orders</Text>
          <Text style={styles.emptyText}>Please try again.</Text>
          <Pressable onPress={() => refetch()} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>
            {apiError === 'session_expired'
              ? 'Session expired'
              : apiError === 'shopify_token_expired'
              ? 'View orders on pilareta.com'
              : apiError === 'no_shopify_account'
              ? 'No Pilareta account linked'
              : 'No orders yet'}
          </Text>
          <Text style={styles.emptyText}>
            {apiError === 'session_expired'
              ? 'Your session has expired. Please sign in again to view your orders.'
              : apiError === 'shopify_token_expired'
              ? 'Your order history is available on the Pilareta website. Tap below to view your orders.'
              : apiError === 'no_shopify_account'
              ? 'Sign in with your Pilareta account to view your order history.'
              : apiError === 'orders_not_configured'
              ? 'Order tracking is not available yet. Check back soon!'
              : 'Your order history will appear here after your first purchase.'}
          </Text>
          {apiError === 'session_expired' && (
            <Pressable onPress={() => router.push('/auth/login')} style={styles.retryButton}>
              <Text style={styles.retryText}>Sign In Again</Text>
            </Pressable>
          )}
          {apiError === 'shopify_token_expired' && (
            <Pressable onPress={() => Linking.openURL('https://pilareta.com/orders')} style={styles.retryButton}>
              <Text style={styles.retryText}>View on pilareta.com</Text>
            </Pressable>
          )}
          {apiError === 'no_shopify_account' && (
            <Pressable onPress={() => router.push('/(tabs)/shop')} style={styles.retryButton}>
              <Text style={styles.retryText}>Browse Shop</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          renderItem={({ item }) => <OrderCard order={item} onReorder={handleReorder} />}
          contentContainerStyle={{ padding: spacing.md, gap: spacing.md, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  title: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colors.fg.primary },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  emptyTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.semibold, color: colors.fg.primary, marginBottom: spacing.sm },
  emptyText: { fontSize: typography.sizes.sm, color: colors.fg.tertiary, textAlign: 'center' },
  retryButton: { marginTop: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.md, backgroundColor: colors.fg.primary },
  retryText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.bg.primary },
  card: { backgroundColor: colors.bg.card, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border.default },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  orderName: { fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: colors.fg.primary },
  orderDate: { fontSize: typography.sizes.xs, color: colors.fg.tertiary, marginTop: 2 },
  orderTotal: { fontSize: typography.sizes.base, fontWeight: typography.weights.semibold, color: colors.fg.primary },
  statusBadge: { fontSize: 11, marginTop: 2, textTransform: 'capitalize' },
  lineItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xs },
  lineItemImage: { width: 40, height: 40, borderRadius: 4, backgroundColor: 'rgba(246,237,221,0.05)' },
  lineItemTitle: { fontSize: typography.sizes.sm, color: colors.fg.primary },
  lineItemVariant: { fontSize: 11, color: colors.fg.tertiary, marginTop: 1 },
  lineItemQty: { fontSize: typography.sizes.sm, color: colors.fg.secondary },
  trackButton: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border.default },
  trackButtonText: { fontSize: typography.sizes.sm, color: '#f59e0b' },
  reorderButton: { marginTop: spacing.sm, paddingTop: spacing.sm, paddingVertical: spacing.xs, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border.default, borderRadius: radius.md, alignItems: 'center' },
  reorderText: { fontSize: typography.sizes.sm, fontWeight: typography.weights.medium, color: colors.fg.primary },
});
