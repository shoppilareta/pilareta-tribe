import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, radius, spacing } from '@/theme';

interface BadgeProps {
  text: string;
  variant?: 'default' | 'accent' | 'success' | 'warning';
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export function Badge({ text, variant = 'default', size = 'sm', style }: BadgeProps) {
  return (
    <View style={[styles.base, sizeStyles[size], variantStyles[variant], style]}>
      <Text style={[styles.text, sizeTextStyles[size], variantTextStyles[variant]]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: typography.weights.medium,
  },
});

const sizeStyles: Record<string, ViewStyle> = {
  sm: { paddingHorizontal: 8, paddingVertical: 2 },
  md: { paddingHorizontal: 12, paddingVertical: 4 },
};

const sizeTextStyles: Record<string, { fontSize: number }> = {
  sm: { fontSize: typography.sizes.xs },
  md: { fontSize: typography.sizes.sm },
};

const variantStyles: Record<string, ViewStyle> = {
  default: { backgroundColor: colors.cream10 },
  accent: { backgroundColor: 'rgba(245, 158, 11, 0.2)' },
  success: { backgroundColor: 'rgba(34, 197, 94, 0.2)' },
  warning: { backgroundColor: 'rgba(234, 179, 8, 0.2)' },
};

const variantTextStyles: Record<string, { color: string }> = {
  default: { color: colors.fg.secondary },
  accent: { color: colors.accent.amber },
  success: { color: 'rgb(34, 197, 94)' },
  warning: { color: 'rgb(234, 179, 8)' },
};
