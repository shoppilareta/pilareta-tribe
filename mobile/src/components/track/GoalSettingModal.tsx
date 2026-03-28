import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Pressable, ActivityIndicator, Alert } from 'react-native';
import { colors, typography, spacing, radius } from '@/theme';
import { updateGoals } from '@/api/track';
import Svg, { Path } from 'react-native-svg';

interface GoalSettingModalProps {
  visible: boolean;
  onClose: () => void;
  currentWorkoutGoal: number | null;
  currentMinuteGoal: number | null;
  onSaved: () => void;
}

function Stepper({
  label,
  value,
  min,
  max,
  step,
  formatValue,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  formatValue?: (v: number) => string;
  onChange: (v: number) => void;
}) {
  const display = formatValue ? formatValue(value) : String(value);
  const canDecrement = value > min;
  const canIncrement = value < max;

  return (
    <View style={stepperStyles.container}>
      <Text style={stepperStyles.label}>{label}</Text>
      <View style={stepperStyles.controls}>
        <Pressable
          onPress={() => canDecrement && onChange(value - step)}
          style={[stepperStyles.button, !canDecrement && stepperStyles.buttonDisabled]}
          disabled={!canDecrement}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={canDecrement ? colors.fg.primary : colors.fg.disabled} strokeWidth={2}>
            <Path d="M5 12h14" strokeLinecap="round" />
          </Svg>
        </Pressable>
        <Text style={stepperStyles.value}>{display}</Text>
        <Pressable
          onPress={() => canIncrement && onChange(value + step)}
          style={[stepperStyles.button, !canIncrement && stepperStyles.buttonDisabled]}
          disabled={!canIncrement}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={canIncrement ? colors.fg.primary : colors.fg.disabled} strokeWidth={2}>
            <Path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </Svg>
        </Pressable>
      </View>
    </View>
  );
}

export function GoalSettingModal({
  visible,
  onClose,
  currentWorkoutGoal,
  currentMinuteGoal,
  onSaved,
}: GoalSettingModalProps) {
  const [workoutGoal, setWorkoutGoal] = useState(currentWorkoutGoal ?? 4);
  const [minuteGoal, setMinuteGoal] = useState(currentMinuteGoal ?? 150);
  const [saving, setSaving] = useState(false);

  // Re-sync when modal opens with potentially new values
  useEffect(() => {
    if (visible) {
      setWorkoutGoal(currentWorkoutGoal ?? 4);
      setMinuteGoal(currentMinuteGoal ?? 150);
    }
  }, [visible, currentWorkoutGoal, currentMinuteGoal]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateGoals({
        weeklyWorkoutGoal: workoutGoal,
        weeklyMinuteGoal: minuteGoal,
      });
      onSaved();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to save goals. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async () => {
    setSaving(true);
    try {
      await updateGoals({
        weeklyWorkoutGoal: null,
        weeklyMinuteGoal: null,
      });
      onSaved();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to clear goals. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />

          <Text style={styles.title}>Set Weekly Goals</Text>
          <Text style={styles.subtitle}>
            Choose targets that keep you consistent
          </Text>

          <View style={styles.steppersContainer}>
            <Stepper
              label="Workouts per week"
              value={workoutGoal}
              min={1}
              max={7}
              step={1}
              formatValue={(v) => `${v} days`}
              onChange={setWorkoutGoal}
            />

            <Stepper
              label="Minutes per week"
              value={minuteGoal}
              min={30}
              max={600}
              step={30}
              formatValue={(v) => `${v} min`}
              onChange={setMinuteGoal}
            />
          </View>

          <Pressable
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color={colors.button.primaryText} size="small" />
            ) : (
              <Text style={styles.saveButtonText}>Save Goals</Text>
            )}
          </Pressable>

          {(currentWorkoutGoal != null || currentMinuteGoal != null) && (
            <Pressable
              style={styles.clearButton}
              onPress={handleClear}
              disabled={saving}
            >
              <Text style={styles.clearButtonText}>Clear Goals</Text>
            </Pressable>
          )}

          <Pressable style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const stepperStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  label: {
    fontSize: typography.sizes.base,
    color: colors.fg.primary,
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.cream10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  value: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
    minWidth: 64,
    textAlign: 'center',
  },
});

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.bg.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bg.primary,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    paddingBottom: spacing.xl + 16,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.cream20,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.fg.tertiary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  steppersContainer: {
    marginBottom: spacing.lg,
  },
  saveButton: {
    backgroundColor: colors.button.primaryBg,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.button.primaryText,
  },
  clearButton: {
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.error,
  },
  clearButtonText: {
    fontSize: typography.sizes.base,
    color: colors.error,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: typography.sizes.base,
    color: colors.fg.tertiary,
  },
});
