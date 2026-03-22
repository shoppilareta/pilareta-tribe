import React from 'react';
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

export function SizeGuideModal({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* Content card from bottom */}
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Size Guide</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
              <Path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </Svg>
          </Pressable>
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
          {SIZE_DATA.map((row, i) => (
            <View key={row.size} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
              <Text style={[styles.cell, styles.sizeCell]}>{row.size}</Text>
              <Text style={styles.cell}>{row.bust}"</Text>
              <Text style={styles.cell}>{row.waist}"</Text>
              <Text style={styles.cell}>{row.hips}"</Text>
            </View>
          ))}
        </ScrollView>

        <Text style={styles.note}>All measurements are in inches</Text>
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
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
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
