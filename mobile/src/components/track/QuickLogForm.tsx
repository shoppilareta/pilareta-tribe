import { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/ui';
import { colors, typography, spacing, radius } from '@/theme';
import { createLog, updateLog } from '@/api/track';
import { scheduleInactivityReminder } from '@/hooks/useInactivityReminder';
import type { CreateWorkoutLogRequest, UpdateWorkoutLogRequest } from '@shared/types';

const DURATION_OPTIONS = [15, 20, 30, 45, 60];
const WORKOUT_TYPES = [
  { label: 'Reformer', value: 'reformer', group: 'Pilates' },
  { label: 'Mat', value: 'mat', group: 'Pilates' },
  { label: 'Tower', value: 'tower', group: 'Pilates' },
  { label: 'Yoga', value: 'yoga', group: 'Other' },
  { label: 'Running', value: 'running', group: 'Other' },
  { label: 'Stretching', value: 'stretching', group: 'Other' },
  { label: 'Strength', value: 'strength_training', group: 'Other' },
  { label: 'Other', value: 'other', group: 'Other' },
];
const ALL_FOCUS_AREAS = [
  { value: 'core', label: 'Core' },
  { value: 'glutes', label: 'Glutes' },
  { value: 'legs', label: 'Legs' },
  { value: 'arms', label: 'Arms' },
  { value: 'back', label: 'Back' },
  { value: 'mobility', label: 'Mobility' },
  { value: 'flexibility', label: 'Flexibility' },
  { value: 'balance', label: 'Balance' },
  { value: 'mindfulness', label: 'Mindfulness' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'endurance', label: 'Endurance' },
  { value: 'recovery', label: 'Recovery' },
  { value: 'upper_body', label: 'Upper Body' },
  { value: 'lower_body', label: 'Lower Body' },
  { value: 'full_body', label: 'Full Body' },
];

// Suggested focus areas per workout type (highlighted but all remain selectable)
const SUGGESTED_FOCUS_AREAS: Record<string, string[]> = {
  reformer: ['core', 'glutes', 'legs', 'arms', 'back', 'mobility'],
  mat: ['core', 'glutes', 'legs', 'arms', 'back', 'mobility'],
  tower: ['core', 'glutes', 'legs', 'arms', 'back', 'mobility'],
  yoga: ['flexibility', 'balance', 'mindfulness', 'core'],
  running: ['cardio', 'endurance', 'legs'],
  stretching: ['flexibility', 'mobility', 'recovery'],
  strength_training: ['upper_body', 'lower_body', 'core', 'full_body'],
  other: ALL_FOCUS_AREAS.map((a) => a.value),
};

interface EditLogData {
  id: string;
  workoutDate: string;
  durationMinutes: number;
  workoutType: string;
  rpe: number;
  notes: string | null;
  focusAreas: string[];
  studioId?: string | null;
  customStudioName?: string | null;
}

interface QuickLogFormProps {
  onComplete: () => void;
  onCancel: () => void;
  editLog?: EditLogData;
}

export function QuickLogForm({ onComplete, onCancel, editLog }: QuickLogFormProps) {
  const isEditMode = !!editLog;

  // Date options (today + past 7 days)
  const dateOptions = useMemo(() => {
    const options: { value: string; label: string }[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const value = date.toISOString().split('T')[0];
      const label =
        i === 0 ? 'Today' : i === 1 ? 'Yesterday' : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      options.push({ value, label });
    }
    return options;
  }, []);

  const getInitialDate = () => {
    if (editLog?.workoutDate) return editLog.workoutDate.split('T')[0];
    return new Date().toISOString().split('T')[0];
  };

  const [workoutDate, setWorkoutDate] = useState(getInitialDate());
  const [durationMinutes, setDurationMinutes] = useState(editLog?.durationMinutes || 30);
  const [customDuration, setCustomDuration] = useState(
    editLog && !DURATION_OPTIONS.includes(editLog.durationMinutes) ? String(editLog.durationMinutes) : ''
  );
  const [workoutType, setWorkoutType] = useState(editLog?.workoutType || 'reformer');
  const [rpe, setRpe] = useState(editLog?.rpe || 5);
  const [focusAreas, setFocusAreas] = useState<string[]>(editLog?.focusAreas || []);
  const [notes, setNotes] = useState(editLog?.notes || '');
  const [showMore, setShowMore] = useState(isEditMode);
  const [loading, setLoading] = useState(false);

  const toggleFocusArea = (area: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFocusAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const duration = customDuration ? parseInt(customDuration, 10) : durationMinutes;

      if (isEditMode && editLog) {
        const data: UpdateWorkoutLogRequest = {
          workoutDate,
          durationMinutes: duration,
          workoutType,
          rpe,
          focusAreas,
          notes: notes || null,
        };
        await updateLog(editLog.id, data);
      } else {
        const data: CreateWorkoutLogRequest = {
          workoutDate,
          durationMinutes: duration,
          workoutType,
          rpe,
          focusAreas,
          notes: notes || undefined,
        };
        await createLog(data);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      scheduleInactivityReminder(); // Reset 7-day inactivity reminder
      onComplete();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', isEditMode ? 'Failed to update workout' : 'Failed to log workout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Date Selector */}
      <Text style={styles.sectionLabel}>When?</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        <View style={styles.chipRow}>
          {dateOptions.map((opt) => (
            <Pressable
              key={opt.value}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setWorkoutDate(opt.value);
              }}
              style={[styles.chip, workoutDate === opt.value && styles.chipSelected]}
            >
              <Text style={[styles.chipText, workoutDate === opt.value && styles.chipTextSelected]}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Duration */}
      <Text style={styles.sectionLabel}>Duration</Text>
      <View style={styles.chipRow}>
        {DURATION_OPTIONS.map((d) => (
          <Pressable
            key={d}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setDurationMinutes(d);
              setCustomDuration('');
            }}
            style={[styles.chip, durationMinutes === d && !customDuration && styles.chipSelected]}
          >
            <Text style={[styles.chipText, durationMinutes === d && !customDuration && styles.chipTextSelected]}>
              {d}m
            </Text>
          </Pressable>
        ))}
        <TextInput
          style={[styles.customInput, customDuration ? styles.customInputActive : undefined]}
          placeholder="__"
          placeholderTextColor={colors.fg.muted}
          value={customDuration}
          onChangeText={(text) => {
            setCustomDuration(text.replace(/[^0-9]/g, ''));
          }}
          keyboardType="number-pad"
          maxLength={3}
        />
      </View>

      {/* Type */}
      <Text style={styles.sectionLabel}>Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        <View style={styles.typeChipRow}>
          {/* Pilates group */}
          {WORKOUT_TYPES.filter((t) => t.group === 'Pilates').map((t) => (
            <Pressable
              key={t.value}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setWorkoutType(t.value);
              }}
              style={[styles.chip, workoutType === t.value && styles.chipSelected]}
            >
              <Text style={[styles.chipText, workoutType === t.value && styles.chipTextSelected]}>
                {t.label}
              </Text>
            </Pressable>
          ))}
          <View style={styles.typeDivider} />
          {/* Other group */}
          {WORKOUT_TYPES.filter((t) => t.group === 'Other').map((t) => (
            <Pressable
              key={t.value}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setWorkoutType(t.value);
              }}
              style={[styles.chip, workoutType === t.value && styles.chipSelected]}
            >
              <Text style={[styles.chipText, workoutType === t.value && styles.chipTextSelected]}>
                {t.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* RPE Slider */}
      <Text style={styles.sectionLabel}>Intensity (RPE)</Text>
      <View style={styles.rpeContainer}>
        <View style={styles.rpeRow}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => (
            <Pressable
              key={val}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setRpe(val);
              }}
              style={[styles.rpeDot, rpe === val && styles.rpeDotSelected]}
            >
              <Text style={[styles.rpeText, rpe === val && styles.rpeTextSelected]}>
                {val}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.rpeLabels}>
          <Text style={styles.rpeLabelText}>Light</Text>
          <Text style={styles.rpeLabelText}>Moderate</Text>
          <Text style={styles.rpeLabelText}>All-out</Text>
        </View>
      </View>

      {/* More options toggle */}
      <Pressable
        onPress={() => setShowMore(!showMore)}
        style={styles.moreToggle}
      >
        <Text style={styles.moreToggleText}>
          {showMore ? '\u25B2 Less options' : '\u25BC More options'}
        </Text>
      </Pressable>

      {showMore && (
        <View style={styles.moreSection}>
          {/* Focus Areas */}
          <Text style={styles.sectionLabel}>Focus Areas</Text>
          <View style={styles.chipRow}>
            {(() => {
              const suggested = SUGGESTED_FOCUS_AREAS[workoutType] || SUGGESTED_FOCUS_AREAS.other;
              // Show suggested areas first, then the rest
              const suggestedAreas = ALL_FOCUS_AREAS.filter((a) => suggested.includes(a.value));
              const otherAreas = ALL_FOCUS_AREAS.filter((a) => !suggested.includes(a.value));
              return [...suggestedAreas, ...otherAreas].map((area) => {
                const isSuggested = suggested.includes(area.value);
                const isSelected = focusAreas.includes(area.value);
                return (
                  <Pressable
                    key={area.value}
                    onPress={() => toggleFocusArea(area.value)}
                    style={[
                      styles.chip,
                      isSelected && styles.chipSelected,
                      !isSelected && isSuggested && styles.chipSuggested,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextSelected,
                        !isSelected && isSuggested && styles.chipTextSuggested,
                      ]}
                    >
                      {area.label}
                    </Text>
                  </Pressable>
                );
              });
            })()}
          </View>

          {/* Notes */}
          <Text style={styles.sectionLabel}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="How was your workout?"
            placeholderTextColor={colors.fg.muted}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <Button title="Cancel" variant="ghost" onPress={onCancel} style={{ flex: 1 }} />
        <Button
          title={isEditMode ? 'Save Changes' : 'Log Workout'}
          onPress={handleSubmit}
          loading={loading}
          style={{ flex: 2 }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing['2xl'],
  },
  sectionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.fg.secondary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  chipScroll: {
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeChipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  typeDivider: {
    width: 1,
    backgroundColor: colors.fg.muted,
    marginHorizontal: spacing.xs,
    opacity: 0.3,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.cream10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: colors.fg.primary,
    borderColor: colors.fg.primary,
  },
  chipSuggested: {
    borderColor: colors.fg.tertiary,
  },
  chipText: {
    fontSize: typography.sizes.sm,
    color: colors.fg.secondary,
    fontWeight: typography.weights.medium,
  },
  chipTextSelected: {
    color: colors.bg.primary,
  },
  chipTextSuggested: {
    color: colors.fg.secondary,
  },
  customInput: {
    width: 48,
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.cream10,
    fontSize: typography.sizes.sm,
    color: colors.fg.primary,
    textAlign: 'center',
    fontWeight: typography.weights.medium,
  },
  customInputActive: {
    backgroundColor: colors.fg.primary,
    color: colors.bg.primary,
  },
  rpeContainer: {
    marginBottom: spacing.sm,
  },
  rpeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  rpeDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cream10,
  },
  rpeDotSelected: {
    backgroundColor: colors.fg.primary,
  },
  rpeText: {
    fontSize: typography.sizes.xs,
    color: colors.fg.tertiary,
    fontWeight: typography.weights.medium,
  },
  rpeTextSelected: {
    color: colors.bg.primary,
    fontWeight: typography.weights.bold,
  },
  rpeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rpeLabelText: {
    fontSize: 10,
    color: colors.fg.muted,
  },
  moreToggle: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  moreToggleText: {
    fontSize: typography.sizes.sm,
    color: colors.fg.tertiary,
  },
  moreSection: {
    marginBottom: spacing.md,
  },
  notesInput: {
    backgroundColor: colors.bg.input,
    borderWidth: 1,
    borderColor: colors.border.hover,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: typography.sizes.base,
    color: colors.fg.primary,
    minHeight: 80,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
});
