import { useState, useMemo, useCallback, memo } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import Svg, { Path } from 'react-native-svg';
import { Card } from '@/components/ui';
import { useAuthStore } from '@/stores/authStore';
import { getLogs } from '@/api/track';
import { colors, typography, spacing, radius } from '@/theme';
import type { WorkoutLog } from '@shared/types';

// --- Helpers ---

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WORKOUT_TYPE_LABELS: Record<string, string> = {
  reformer: 'Reformer',
  mat: 'Mat',
  tower: 'Tower',
  other: 'Other',
};

const WORKOUT_TYPE_COLORS: Record<string, string> = {
  reformer: 'rgba(34, 197, 94, 0.9)',   // green
  mat: 'rgba(59, 130, 246, 0.9)',        // blue
  tower: 'rgba(249, 115, 22, 0.9)',      // orange
  other: 'rgba(168, 85, 247, 0.9)',      // purple
};

function getWorkoutDotColor(workoutType: string): string {
  return WORKOUT_TYPE_COLORS[workoutType] || WORKOUT_TYPE_COLORS.other;
}

function formatDuration(mins: number): string {
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const remaining = mins % 60;
  if (remaining === 0) return `${hours}h`;
  return `${hours}h ${remaining}m`;
}

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getMonthStart(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-01`;
}

function getMonthEnd(year: number, month: number): string {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

interface DayData {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  dateKey: string;
}

function buildCalendarGrid(year: number, month: number): DayData[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const firstOfMonth = new Date(year, month, 1);
  const startDayOfWeek = firstOfMonth.getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Previous month padding
  const prevMonthDays = new Date(year, month, 0).getDate();

  const grid: DayData[] = [];

  // Days from previous month
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const date = new Date(year, month - 1, d);
    grid.push({
      date,
      day: d,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      dateKey: toDateKey(date),
    });
  }

  // Days in current month
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d);
    grid.push({
      date,
      day: d,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
      dateKey: toDateKey(date),
    });
  }

  // Next month padding to fill complete rows (always 6 rows = 42 cells)
  const remaining = 42 - grid.length;
  for (let d = 1; d <= remaining; d++) {
    const date = new Date(year, month + 1, d);
    grid.push({
      date,
      day: d,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      dateKey: toDateKey(date),
    });
  }

  return grid;
}

// --- Types ---

interface WorkoutsByDay {
  [dateKey: string]: WorkoutLog[];
}

// --- Sub-components ---

interface DayCellProps {
  dayData: DayData;
  workouts: WorkoutLog[];
  isSelected: boolean;
  onPress: (dateKey: string) => void;
}

const DayCell = memo(function DayCell({ dayData, workouts, isSelected, onPress }: DayCellProps) {
  const hasWorkouts = workouts.length > 0;
  const uniqueTypes = useMemo(() => {
    const types = new Set(workouts.map((w) => w.workoutType));
    return Array.from(types).slice(0, 3);
  }, [workouts]);

  return (
    <Pressable
      style={[
        styles.dayCell,
        isSelected && styles.dayCellSelected,
        dayData.isToday && styles.dayCellToday,
      ]}
      onPress={() => onPress(dayData.dateKey)}
      accessibilityRole="button"
      accessibilityLabel={`${dayData.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}${hasWorkouts ? `, ${workouts.length} workout${workouts.length > 1 ? 's' : ''}` : ''}`}
    >
      <Text
        style={[
          styles.dayText,
          !dayData.isCurrentMonth && styles.dayTextMuted,
          dayData.isToday && styles.dayTextToday,
          isSelected && styles.dayTextSelected,
        ]}
      >
        {dayData.day}
      </Text>
      <View style={styles.dotsRow}>
        {uniqueTypes.map((type) => (
          <View
            key={type}
            style={[styles.dot, { backgroundColor: getWorkoutDotColor(type) }]}
          />
        ))}
        {workouts.length > 3 && (
          <View style={[styles.dot, { backgroundColor: colors.fg.muted }]} />
        )}
      </View>
    </Pressable>
  );
});

interface DaySummaryProps {
  dateKey: string;
  workouts: WorkoutLog[];
}

function DaySummary({ dateKey, workouts }: DaySummaryProps) {
  if (workouts.length === 0) {
    const date = new Date(dateKey + 'T00:00:00');
    return (
      <Card padding="md" style={styles.summaryCard}>
        <Text style={styles.summaryDate}>
          {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
        <Text style={styles.summaryEmpty}>No workouts logged</Text>
      </Card>
    );
  }

  const date = new Date(dateKey + 'T00:00:00');
  const totalMinutes = workouts.reduce((sum, w) => sum + w.durationMinutes, 0);

  return (
    <Card padding="md" style={styles.summaryCard}>
      <Text style={styles.summaryDate}>
        {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </Text>
      <Text style={styles.summaryCount}>
        {workouts.length} workout{workouts.length > 1 ? 's' : ''} &middot; {formatDuration(totalMinutes)}
      </Text>
      <View style={styles.summaryList}>
        {workouts.map((log) => (
          <View key={log.id} style={styles.summaryItem}>
            <View style={[styles.summaryDot, { backgroundColor: getWorkoutDotColor(log.workoutType) }]} />
            <Text style={styles.summaryType}>
              {WORKOUT_TYPE_LABELS[log.workoutType] || log.workoutType}
            </Text>
            <Text style={styles.summaryDuration}>{formatDuration(log.durationMinutes)}</Text>
            <Text style={styles.summaryRpe}>RPE {log.rpe}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
}

interface MonthlyStatsProps {
  workouts: WorkoutLog[];
  currentStreak: number;
}

interface MonthlyStatsEnhancedProps extends MonthlyStatsProps {
  year: number;
  month: number;
  prevMonthWorkoutCount: number | null;
}

function MonthlyStats({ workouts, currentStreak, year, month, prevMonthWorkoutCount }: MonthlyStatsEnhancedProps) {
  const totalWorkouts = workouts.length;
  const totalMinutes = workouts.reduce((sum, w) => sum + w.durationMinutes, 0);
  const activeDays = new Set(workouts.map((w) => w.workoutDate.slice(0, 10))).size;

  // Consistency: days with workout / days elapsed in month
  const today = new Date();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
  const daysElapsed = isCurrentMonth ? today.getDate() : daysInMonth;
  const consistency = daysElapsed > 0 ? Math.round((activeDays / daysElapsed) * 100) : 0;

  // Comparison with previous month
  let comparisonText: string | null = null;
  if (prevMonthWorkoutCount !== null) {
    const diff = totalWorkouts - prevMonthWorkoutCount;
    if (diff > 0) {
      const prevMonthIdx = month === 0 ? 11 : month - 1;
      comparisonText = `\u2191 ${diff} more than ${MONTH_NAMES[prevMonthIdx].slice(0, 3)}`;
    } else if (diff < 0) {
      const prevMonthIdx = month === 0 ? 11 : month - 1;
      comparisonText = `\u2193 ${Math.abs(diff)} fewer than ${MONTH_NAMES[prevMonthIdx].slice(0, 3)}`;
    } else {
      const prevMonthIdx = month === 0 ? 11 : month - 1;
      comparisonText = `Same as ${MONTH_NAMES[prevMonthIdx].slice(0, 3)}`;
    }
  }

  const statItems = [
    { label: 'Workouts', value: String(totalWorkouts) },
    { label: 'Minutes', value: formatDuration(totalMinutes) },
    { label: 'Active Days', value: String(activeDays) },
    { label: 'Streak', value: `${currentStreak}d` },
  ];

  return (
    <View>
      <View style={styles.monthlyStatsRow}>
        {statItems.map((item) => (
          <View key={item.label} style={styles.monthlyStat}>
            <Text style={styles.monthlyStatValue}>{item.value}</Text>
            <Text style={styles.monthlyStatLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Consistency & comparison row */}
      <View style={styles.consistencyRow}>
        <Text style={styles.consistencyText}>
          Consistency: {consistency}%
        </Text>
        {comparisonText && (
          <Text style={styles.comparisonText}>{comparisonText}</Text>
        )}
      </View>
    </View>
  );
}

// --- Legend ---

function WorkoutTypeLegend() {
  const types = Object.entries(WORKOUT_TYPE_COLORS);
  return (
    <View style={styles.legendRow}>
      {types.map(([key, color]) => (
        <View key={key} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: color }]} />
          <Text style={styles.legendText}>{WORKOUT_TYPE_LABELS[key] || key}</Text>
        </View>
      ))}
    </View>
  );
}

// --- Main Component ---

interface MonthlyCalendarProps {
  currentStreak?: number;
}

export function MonthlyCalendar({ currentStreak = 0 }: MonthlyCalendarProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(toDateKey(today));

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  // Fetch logs for the displayed month
  const { data, isLoading } = useQuery({
    queryKey: ['track-calendar-logs', year, month],
    queryFn: () => getLogs({
      startDate: getMonthStart(year, month),
      endDate: getMonthEnd(year, month),
      limit: 200,
    }),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });

  const logs = data?.logs ?? [];

  // Fetch previous month's logs for comparison
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;

  const { data: prevData } = useQuery({
    queryKey: ['track-calendar-logs', prevYear, prevMonth],
    queryFn: () => getLogs({
      startDate: getMonthStart(prevYear, prevMonth),
      endDate: getMonthEnd(prevYear, prevMonth),
      limit: 200,
    }),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });

  const prevMonthWorkoutCount = prevData ? prevData.logs.length : null;

  // Group workouts by date key
  const workoutsByDay: WorkoutsByDay = useMemo(() => {
    const map: WorkoutsByDay = {};
    for (const log of logs) {
      const key = log.workoutDate.slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(log);
    }
    return map;
  }, [logs]);

  // Build calendar grid
  const grid = useMemo(() => buildCalendarGrid(year, month), [year, month]);

  // Navigation
  const goToPrevMonth = useCallback(() => {
    if (month === 0) {
      setYear((y) => y - 1);
      setMonth(11);
    } else {
      setMonth((m) => m - 1);
    }
    setSelectedDate(null);
  }, [month]);

  const goToNextMonth = useCallback(() => {
    // Don't navigate past current month
    if (isCurrentMonth) return;
    if (month === 11) {
      setYear((y) => y + 1);
      setMonth(0);
    } else {
      setMonth((m) => m + 1);
    }
    setSelectedDate(null);
  }, [month, isCurrentMonth]);

  const goToToday = useCallback(() => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelectedDate(toDateKey(today));
  }, [today]);

  const handleDayPress = useCallback((dateKey: string) => {
    setSelectedDate((prev) => (prev === dateKey ? null : dateKey));
  }, []);

  // Selected day workouts
  const selectedWorkouts = selectedDate ? (workoutsByDay[selectedDate] ?? []) : [];

  return (
    <View style={styles.container}>
      {/* Month Navigation Header */}
      <View style={styles.navRow}>
        <Pressable
          onPress={goToPrevMonth}
          style={styles.navButton}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
        >
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.fg.primary} strokeWidth={2}>
            <Path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>

        <Pressable onPress={goToToday} accessibilityRole="button" accessibilityLabel="Go to today">
          <Text style={styles.monthTitle}>
            {MONTH_NAMES[month]} {year}
          </Text>
        </Pressable>

        <Pressable
          onPress={goToNextMonth}
          style={[styles.navButton, isCurrentMonth && styles.navButtonDisabled]}
          disabled={isCurrentMonth}
          accessibilityRole="button"
          accessibilityLabel="Next month"
        >
          <Svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke={isCurrentMonth ? colors.fg.muted : colors.fg.primary}
            strokeWidth={2}
          >
            <Path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </Pressable>
      </View>

      {/* Calendar Grid */}
      <Card padding="sm" style={styles.calendarCard}>
        {/* Weekday Headers */}
        <View style={styles.weekdayRow}>
          {WEEKDAY_LABELS.map((label) => (
            <View key={label} style={styles.weekdayCell}>
              <Text style={styles.weekdayText}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Loading overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={colors.fg.primary} />
          </View>
        )}

        {/* Day Grid */}
        <View style={styles.dayGrid}>
          {grid.map((dayData) => (
            <DayCell
              key={dayData.dateKey}
              dayData={dayData}
              workouts={workoutsByDay[dayData.dateKey] ?? []}
              isSelected={selectedDate === dayData.dateKey}
              onPress={handleDayPress}
            />
          ))}
        </View>

        {/* Legend */}
        <WorkoutTypeLegend />
      </Card>

      {/* Day Summary (when a day is tapped) */}
      {selectedDate && (
        <DaySummary dateKey={selectedDate} workouts={selectedWorkouts} />
      )}

      {/* Monthly Stats Summary */}
      <Card padding="md" style={styles.monthlyStatsCard}>
        <Text style={styles.monthlyStatsTitle}>
          {isCurrentMonth ? 'This Month' : `${MONTH_NAMES[month]} ${year}`}
        </Text>
        <MonthlyStats
          workouts={logs}
          currentStreak={currentStreak}
          year={year}
          month={month}
          prevMonthWorkoutCount={prevMonthWorkoutCount}
        />
      </Card>
    </View>
  );
}

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },

  // Navigation
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    marginBottom: spacing.xs,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cream05,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  monthTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
  },

  // Calendar Card
  calendarCard: {
    overflow: 'hidden',
  },

  // Weekday headers
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  weekdayText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.fg.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Day grid
  dayGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    gap: 2,
  },
  dayCellSelected: {
    backgroundColor: colors.cream10,
  },
  dayCellToday: {
    borderWidth: 1.5,
    borderColor: colors.border.focus,
  },
  dayText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.regular,
    color: colors.fg.primary,
  },
  dayTextMuted: {
    color: colors.fg.muted,
  },
  dayTextToday: {
    fontWeight: typography.weights.bold,
    color: colors.fg.primary,
  },
  dayTextSelected: {
    fontWeight: typography.weights.semibold,
  },

  // Workout dots
  dotsRow: {
    flexDirection: 'row',
    gap: 2,
    height: 6,
    alignItems: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },

  // Legend
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 10,
    color: colors.fg.tertiary,
  },

  // Loading overlay
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(32, 34, 25, 0.4)',
    zIndex: 1,
    borderRadius: radius.md,
  },

  // Day Summary
  summaryCard: {
    gap: spacing.sm,
  },
  summaryDate: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
  },
  summaryCount: {
    fontSize: typography.sizes.sm,
    color: colors.fg.secondary,
  },
  summaryEmpty: {
    fontSize: typography.sizes.sm,
    color: colors.fg.tertiary,
    fontStyle: 'italic',
  },
  summaryList: {
    gap: spacing.xs,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  summaryType: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.fg.primary,
  },
  summaryDuration: {
    fontSize: typography.sizes.sm,
    color: colors.fg.secondary,
  },
  summaryRpe: {
    fontSize: typography.sizes.xs,
    color: colors.fg.tertiary,
    minWidth: 44,
    textAlign: 'right',
  },

  // Monthly Stats
  monthlyStatsCard: {
    gap: spacing.sm,
  },
  monthlyStatsTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.fg.primary,
  },
  monthlyStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthlyStat: {
    flex: 1,
    alignItems: 'center',
  },
  monthlyStatValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
    marginBottom: 2,
  },
  monthlyStatLabel: {
    fontSize: 10,
    color: colors.fg.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  consistencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  consistencyText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.fg.secondary,
  },
  comparisonText: {
    fontSize: typography.sizes.xs,
    color: colors.fg.tertiary,
  },
});
