import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Button } from '@/components/ui';
import { colors, typography, spacing, radius } from '@/theme';
import { buildSession } from '@/api/learn';

const GOALS = [
  { value: 'core_stability', label: 'Core Stability', emoji: '\u{1F3AF}' },
  { value: 'glutes', label: 'Glutes & Hips', emoji: '\u{1F34E}' },
  { value: 'legs', label: 'Legs', emoji: '\u{1F9B5}' },
  { value: 'posture', label: 'Posture', emoji: '\u{1F9D8}' },
  { value: 'mobility', label: 'Mobility', emoji: '\u{1F938}' },
  { value: 'full_body', label: 'Full Body', emoji: '\u{2B50}' },
];

const DURATIONS = [15, 20, 30, 45, 60];

const LEVELS = [
  { value: 'beginner', label: 'Beginner', description: 'New to Pilates or getting back into it' },
  { value: 'intermediate', label: 'Intermediate', description: 'Comfortable with basics, ready for more' },
  { value: 'advanced', label: 'Advanced', description: 'Experienced practitioner' },
];

const CONSTRAINTS = [
  { value: 'knee_sensitive', label: 'Knees', emoji: '\u{1F9B5}' },
  { value: 'wrist_sensitive', label: 'Wrists', emoji: '\u{1F90F}' },
  { value: 'shoulder_sensitive', label: 'Shoulders', emoji: '\u{1F4AA}' },
  { value: 'lower_back_sensitive', label: 'Lower Back', emoji: '\u{1F519}' },
];

export function SessionBuilder() {
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState(30);
  const [level, setLevel] = useState('');
  const [constraints, setConstraints] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleConstraint = (c: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setConstraints((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const canBuild = goal && level;

  const handleBuild = async () => {
    if (!canBuild) return;
    setLoading(true);
    try {
      const result = await buildSession({ goal, duration, level, constraints });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push(`/(tabs)/learn/session/${result.sessionId}`);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to build session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {/* Goal */}
      <Text style={styles.sectionLabel}>What's your goal?</Text>
      <View style={styles.goalGrid}>
        {GOALS.map((g) => (
          <Pressable
            key={g.value}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setGoal(g.value); }}
            style={[styles.goalCard, goal === g.value && styles.goalCardSelected]}
          >
            <Text style={styles.goalEmoji}>{g.emoji}</Text>
            <Text style={[styles.goalLabel, goal === g.value && styles.goalLabelSelected]}>{g.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Duration */}
      <Text style={styles.sectionLabel}>Duration</Text>
      <View style={styles.chipRow}>
        {DURATIONS.map((d) => (
          <Pressable
            key={d}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setDuration(d); }}
            style={[styles.chip, duration === d && styles.chipSelected]}
          >
            <Text style={[styles.chipText, duration === d && styles.chipTextSelected]}>{d} min</Text>
          </Pressable>
        ))}
      </View>

      {/* Level */}
      <Text style={styles.sectionLabel}>Your level</Text>
      <View style={styles.levelList}>
        {LEVELS.map((l) => (
          <Pressable
            key={l.value}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setLevel(l.value); }}
            style={[styles.levelCard, level === l.value && styles.levelCardSelected]}
          >
            <Text style={[styles.levelLabel, level === l.value && styles.levelLabelSelected]}>{l.label}</Text>
            <Text style={styles.levelDesc}>{l.description}</Text>
          </Pressable>
        ))}
      </View>

      {/* Constraints */}
      <Text style={styles.sectionLabel}>Any sensitivities? (optional)</Text>
      <View style={styles.chipRow}>
        {CONSTRAINTS.map((c) => (
          <Pressable
            key={c.value}
            onPress={() => toggleConstraint(c.value)}
            style={[styles.chip, constraints.includes(c.value) && styles.chipSelected]}
          >
            <Text style={[styles.chipText, constraints.includes(c.value) && styles.chipTextSelected]}>
              {c.emoji} {c.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Build button */}
      <Button
        title="Build My Session"
        onPress={handleBuild}
        loading={loading}
        disabled={!canBuild}
        style={styles.buildButton}
      />
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
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.lg,
  },
  goalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  goalCard: {
    width: '48%',
    flexGrow: 1,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
  },
  goalCardSelected: {
    borderColor: colors.fg.primary,
    backgroundColor: colors.cream10,
  },
  goalEmoji: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  goalLabel: {
    fontSize: typography.sizes.sm,
    color: colors.fg.secondary,
    fontWeight: typography.weights.medium,
    textAlign: 'center',
  },
  goalLabelSelected: {
    color: colors.fg.primary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
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
  chipText: {
    fontSize: typography.sizes.sm,
    color: colors.fg.secondary,
    fontWeight: typography.weights.medium,
  },
  chipTextSelected: {
    color: colors.bg.primary,
  },
  levelList: {
    gap: spacing.sm,
  },
  levelCard: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.bg.card,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  levelCardSelected: {
    borderColor: colors.fg.primary,
    backgroundColor: colors.cream10,
  },
  levelLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.fg.secondary,
    marginBottom: 2,
  },
  levelLabelSelected: {
    color: colors.fg.primary,
  },
  levelDesc: {
    fontSize: typography.sizes.sm,
    color: colors.fg.tertiary,
  },
  buildButton: {
    marginTop: spacing.xl,
  },
});
