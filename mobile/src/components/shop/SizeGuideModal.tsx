import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, Pressable, ScrollView } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const SIZE_DATA = [
  { size: 'XS', bust: '31-32', waist: '24-25', hips: '34-35' },
  { size: 'S', bust: '33-34', waist: '26-27', hips: '36-37' },
  { size: 'M', bust: '35-36', waist: '28-29', hips: '38-39' },
  { size: 'L', bust: '37-39', waist: '30-32', hips: '40-42' },
  { size: 'XL', bust: '40-42', waist: '33-35', hips: '43-45' },
  { size: 'XXL', bust: '43-45', waist: '36-38', hips: '46-48' },
];

/** Convert an inches range string like "31-32" to cm, rounding each value to nearest 0.5 */
function inchRangeToCm(range: string): string {
  return range
    .split('-')
    .map((v) => {
      const cm = parseFloat(v) * 2.54;
      return (Math.round(cm * 2) / 2).toFixed(1).replace(/\.0$/, '');
    })
    .join('-');
}

const CM_SIZE_DATA = SIZE_DATA.map((row) => ({
  size: row.size,
  bust: inchRangeToCm(row.bust),
  waist: inchRangeToCm(row.waist),
  hips: inchRangeToCm(row.hips),
}));

export function SizeGuideModal({ visible, onClose }: Props) {
  const [unit, setUnit] = useState<'in' | 'cm'>('in');
  const data = unit === 'in' ? SIZE_DATA : CM_SIZE_DATA;
  const suffix = unit === 'in' ? '"' : ' cm';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close size guide" accessibilityRole="button" />

      {/* Content card from bottom */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Size Guide</Text>
          <View style={styles.headerRight}>
            <View style={styles.toggleRow}>
              <Pressable
                style={[styles.toggleButton, unit === 'in' && styles.toggleButtonActive]}
                onPress={() => setUnit('in')}
                accessibilityLabel="Show inches"
                accessibilityRole="button"
                accessibilityState={{ selected: unit === 'in' }}
              >
                <Text style={[styles.toggleText, unit === 'in' && styles.toggleTextActive]}>Inches</Text>
              </Pressable>
              <Pressable
                style={[styles.toggleButton, unit === 'cm' && styles.toggleButtonActive]}
                onPress={() => setUnit('cm')}
                accessibilityLabel="Show centimetres"
                accessibilityRole="button"
                accessibilityState={{ selected: unit === 'cm' }}
              >
                <Text style={[styles.toggleText, unit === 'cm' && styles.toggleTextActive]}>cm</Text>
              </Pressable>
            </View>
            <Pressable onPress={onClose} hitSlop={12} accessibilityLabel="Close size guide" accessibilityRole="button" style={styles.closeButton}>
              <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
                <Path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </Svg>
            </Pressable>
          </View>
        </View>

        {/* Table */}
        <ScrollView>
          {/* Table header row */}
          <View style={styles.tableRow}>
            <Text style={[styles.cell, styles.headerCell]}>Size</Text>
            <Text style={[styles.cell, styles.headerCell]}>Bust</Text>
            <Text style={[styles.cell, styles.headerCell]}>Waist</Text>
            <Text style={[styles.cell, styles.headerCell]}>Hips</Text>
          </View>

          {/* Data rows */}
          {data.map((row, i) => (
            <View key={row.size} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
              <Text style={[styles.cell, styles.sizeCell]}>{row.size}</Text>
              <Text style={styles.cell}>{row.bust}{suffix}</Text>
              <Text style={styles.cell}>{row.waist}{suffix}</Text>
              <Text style={styles.cell}>{row.hips}{suffix}</Text>
            </View>
          ))}
        </ScrollView>

        <Text style={styles.note}>
          All measurements are in {unit === 'in' ? 'inches' : 'centimetres'}
        </Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  content: {
    backgroundColor: colors.bg.primary,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    paddingBottom: spacing.xl,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  closeButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
  },
  toggleRow: {
    flexDirection: 'row',
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
  },
  toggleButton: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
  },
  toggleButtonActive: {
    backgroundColor: colors.fg.primary,
  },
  toggleText: {
    fontSize: typography.sizes.xs,
    color: colors.fg.tertiary,
    fontWeight: typography.weights.medium,
  },
  toggleTextActive: {
    color: colors.bg.primary,
    fontWeight: typography.weights.semibold,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  tableRowAlt: {
    backgroundColor: colors.cream05,
  },
  cell: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.fg.secondary,
    textAlign: 'center',
  },
  headerCell: {
    fontWeight: typography.weights.semibold,
    color: colors.fg.muted,
    fontSize: typography.sizes.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sizeCell: {
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
  },
  note: {
    fontSize: typography.sizes.xs,
    color: colors.fg.muted,
    textAlign: 'center',
    paddingTop: spacing.md,
  },
});
