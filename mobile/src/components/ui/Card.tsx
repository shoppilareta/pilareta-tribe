import { View, ViewProps, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/theme';

interface CardProps extends ViewProps {
  variant?: 'default' | 'elevated';
  padding?: keyof typeof spacing;
}

export function Card({
  variant = 'default',
  padding = 'md',
  style,
  children,
  ...props
}: CardProps) {
  return (
    <View
      style={[
        styles.base,
        { padding: spacing[padding] },
        variant === 'elevated' && styles.elevated,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  elevated: {
    borderColor: colors.border.hover,
  },
});
