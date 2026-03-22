import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Card } from '@/components/ui';
import { colors, typography, spacing } from '@/theme';
import type { PersonalRecords as PersonalRecordsType } from '@shared/types';

interface PersonalRecordsProps {
  records: PersonalRecordsType;
  currentStreak?: number;
}

interface RecordRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}

function RecordRow({ icon, label, value, highlight }: RecordRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.iconWrap}>{icon}</View>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, highlight && styles.valueHighlight]}>{value}</Text>
    </View>
  );
}

export function PersonalRecords({ records, currentStreak = 0 }: PersonalRecordsProps) {
  if (!records) return null;

  const isStreakPR = currentStreak > 0 && currentStreak >= records.bestStreak;

  return (
    <Card padding="md">
      <Text style={styles.title}>Personal Records</Text>

      <View style={styles.rows}>
        <RecordRow
          icon={
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.accent.amber} strokeWidth={2}>
              <Path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          }
          label="Longest session"
          value={`${records.longestSession} min`}
        />

        <RecordRow
          icon={
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.accent.amber} strokeWidth={2}>
              <Path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" strokeLinejoin="round" />
              <Path d="M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          }
          label="Most active week"
          value={`${records.mostActiveWeekWorkouts} workouts`}
        />

        <RecordRow
          icon={
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.accent.amber} strokeWidth={2}>
              <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          }
          label={isStreakPR ? 'Current streak (PR!)' : 'Best streak'}
          value={`${isStreakPR ? currentStreak : records.bestStreak} days`}
          highlight={isStreakPR}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.fg.primary,
    marginBottom: spacing.md,
  },
  rows: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.fg.secondary,
  },
  value: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
  },
  valueHighlight: {
    color: colors.accent.amber,
  },
});
