import { Text as RNText, TextProps, StyleSheet } from 'react-native';
import { colors, typography } from '@/theme';

interface TypographyProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall' | 'caption' | 'label';
  color?: string;
  weight?: keyof typeof typography.weights;
}

export function Typography({
  variant = 'body',
  color,
  weight,
  style,
  ...props
}: TypographyProps) {
  return (
    <RNText
      style={[
        styles[variant],
        color ? { color } : undefined,
        weight ? { fontWeight: typography.weights[weight] } : undefined,
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  h1: {
    fontSize: typography.sizes['2xl'],
    fontWeight: typography.weights.bold,
    color: colors.fg.primary,
    lineHeight: typography.sizes['2xl'] * typography.lineHeights.tight,
  },
  h2: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.fg.primary,
    lineHeight: typography.sizes.xl * typography.lineHeights.tight,
  },
  h3: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
    lineHeight: typography.sizes.lg * typography.lineHeights.tight,
  },
  body: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.regular,
    color: colors.fg.primary,
    lineHeight: typography.sizes.base * typography.lineHeights.normal,
  },
  bodySmall: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    color: colors.fg.secondary,
    lineHeight: typography.sizes.sm * typography.lineHeights.normal,
  },
  caption: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.regular,
    color: colors.fg.tertiary,
    lineHeight: typography.sizes.xs * typography.lineHeights.normal,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.fg.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
