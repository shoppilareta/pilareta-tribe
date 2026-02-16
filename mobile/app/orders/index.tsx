import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';
import { getOrders, type ShopifyOrder } from '@/api/orders';

function formatPrice(amount: string, currency: string) {
  const num = parseFloat(amount);
  if (currency === 'INR') return `\u20B9${num.toFixed(0)}`;
  return `${currency} ${num.toFixed(2)}`;
}

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

function OrderCard({ order }: { order: ShopifyOrder }) {
  const displayStatus = order.cancelledAt ? 'Cancelled' : (order.fulfillmentStatus || order.financialStatus || '').replace(/_/g, ' ');
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

      {trackingInfo.length > 0 && (
        <Pressable onPress={() => Linking.openURL(trackingInfo[0].url)} style={styles.trackButton}>
          <Text style={styles.trackButtonText}>Track shipment</Text>
          <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth={2}>
            <Path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
      )}
    </View>
  );
}

export default function OrdersScreen() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  });

  const orders = data?.orders ?? [];

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

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.fg.primary} />
        </View>
      ) : isError ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>Something went wrong</Text>
          <Text style={styles.emptyText}>Sign in to view your orders.</Text>
          <Pressable onPress={() => refetch()} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptyText}>Your order history will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o.id}
          renderItem={({ item }) => <OrderCard order={item} />}
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
});
