import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OrderConfirmationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 40 }]}>
      {/* Success checkmark circle */}
      <View style={styles.iconCircle}>
        <Svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="rgba(34, 197, 94, 1)" strokeWidth={2.5}>
          <Path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
        </Svg>
      </View>

      <Text style={styles.heading}>Order Placed!</Text>
      <Text style={styles.subtext}>
        Your order is being processed. You'll receive a confirmation email shortly.
      </Text>
      <Text style={styles.delivery}>Estimated delivery: 5-7 business days</Text>

      {/* Buttons */}
      <Pressable style={styles.primaryButton} onPress={() => router.replace('/(tabs)/shop')}>
        <Text style={styles.primaryButtonText}>Continue Shopping</Text>
      </Pressable>

      <Pressable style={styles.outlineButton} onPress={() => router.push('/orders')}>
        <Text style={styles.outlineButtonText}>View My Orders</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(34, 197, 94, 1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  heading: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.fg.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtext: {
    fontSize: typography.sizes.base,
    color: colors.fg.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  delivery: {
    fontSize: typography.sizes.sm,
    color: colors.fg.muted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  primaryButton: {
    backgroundColor: colors.button.primaryBg,
    borderRadius: radius.lg,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  primaryButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.button.primaryText,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.fg.primary,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    width: '100%',
    alignItems: 'center',
  },
  outlineButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
  },
});
