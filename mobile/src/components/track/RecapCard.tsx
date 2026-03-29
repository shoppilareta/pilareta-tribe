import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, radius } from '@/theme';

interface RecapCardProps {
  workoutDate: string;
  durationMinutes: number;
  workoutType: string;
  rpe: number;
  calorieEstimate?: number | null;
  studioName?: string | null;
  sessionName?: string | null;
  currentStreak?: number;
  focusAreas?: string[];
  isPersonalBest?: boolean;
  imageUrl?: string | null;
}

const TYPE_LABELS: Record<string, string> = {
  reformer: 'Reformer',
  mat: 'Mat',
  tower: 'Tower',
  other: 'Pilates',
};

function getRpeColor(value: number): string {
  if (value <= 3) return '#22c55e';
  if (value <= 5) return '#eab308';
  if (value <= 7) return '#f97316';
  return '#ef4444';
}

function getRpeLabel(value: number): string {
  if (value <= 2) return 'Easy';
  if (value <= 4) return 'Light';
  if (value <= 6) return 'Moderate';
  if (value <= 8) return 'Hard';
  return 'All-out';
}

const STREAK_MILESTONES = [7, 14, 30, 60, 100];

function getStreakMilestone(streak: number): number | null {
  // Return the milestone if the streak exactly matches one
  for (const m of STREAK_MILESTONES) {
    if (streak === m) return m;
  }
  return null;
}

const FOCUS_AREA_LABELS: Record<string, string> = {
  core: 'Core',
  glutes: 'Glutes',
  legs: 'Legs',
  arms: 'Arms',
  back: 'Back',
  mobility: 'Mobility',
  posture: 'Posture',
  full_body: 'Full Body',
};

function formatDate(dateStr: string): string {
  // Parse as local time to avoid UTC timezone offset issues with YYYY-MM-DD
  const cleaned = dateStr.slice(0, 10);
  const date = new Date(cleaned + 'T00:00:00');
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export function RecapCard({
  workoutDate,
  durationMinutes,
  workoutType,
  rpe,
  calorieEstimate,
  studioName,
  sessionName,
  currentStreak = 0,
  focusAreas = [],
  isPersonalBest = false,
  imageUrl,
}: RecapCardProps) {
  const streakMilestone = getStreakMilestone(currentStreak);

  const cardContent = (
    <>
      {/* Decorative radial light - premium glow */}
      <View style={styles.radialDecor} />
      <View style={styles.radialDecorBottom} />

      {/* Streak milestone badge */}
      {streakMilestone ? (
        <LinearGradient
          colors={['rgba(245, 158, 11, 0.6)', 'rgba(249, 115, 22, 0.5)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.streakBadge}
        >
          <Text style={styles.streakEmoji}>🏆</Text>
          <Text style={styles.streakText}>{streakMilestone}-Day Streak!</Text>
        </LinearGradient>
      ) : currentStreak > 1 ? (
        <LinearGradient
          colors={['rgba(249, 115, 22, 0.5)', 'rgba(239, 68, 68, 0.4)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.streakBadge}
        >
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakText}>{currentStreak} day streak</Text>
        </LinearGradient>
      ) : null}

      {/* Personal best badge */}
      {isPersonalBest && (
        <View style={styles.personalBestBadge}>
          <Text style={styles.personalBestText}>⭐ New Personal Best!</Text>
        </View>
      )}

      {/* Top section */}
      <View style={styles.topSection}>
        <Text style={styles.topLabel}>WORKOUT COMPLETE</Text>
        <Text style={styles.dateText}>{formatDate(workoutDate)}</Text>
      </View>

      {/* Center hero */}
      <View style={styles.centerSection}>
        <Text style={styles.heroNumber}>{durationMinutes}</Text>
        <Text style={styles.heroSubtext}>
          minutes of {TYPE_LABELS[workoutType] || workoutType}
        </Text>
        {(studioName || sessionName) && (
          <Text style={styles.studioText}>
            {studioName ? `at ${studioName}` : sessionName}
          </Text>
        )}
        {/* Focus area chips */}
        {focusAreas.length > 0 && (
          <View style={styles.focusChipsRow}>
            {focusAreas.slice(0, 4).map((area) => (
              <View key={area} style={styles.focusChip}>
                <Text style={styles.focusChipText}>
                  {FOCUS_AREA_LABELS[area] || area.charAt(0).toUpperCase() + area.slice(1)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Bottom stats row */}
      <View style={styles.bottomSection}>
        {/* RPE */}
        <View style={styles.bottomStat}>
          <View style={[styles.rpeCircle, { backgroundColor: getRpeColor(rpe) }]}>
            <Text style={styles.rpeNumber}>{rpe}</Text>
          </View>
          <Text style={styles.bottomLabel}>{getRpeLabel(rpe)}</Text>
        </View>

        {/* Calories */}
        {calorieEstimate != null && calorieEstimate > 0 && (
          <View style={styles.bottomStat}>
            <Text style={styles.calNumber}>~{calorieEstimate}</Text>
            <Text style={styles.bottomLabel}>EST. CAL</Text>
          </View>
        )}

        {/* Focus areas */}
        {focusAreas.length > 0 && (
          <View style={styles.bottomStat}>
            <View style={styles.focusRow}>
              {focusAreas.slice(0, 3).map((area) => (
                <View key={area} style={styles.focusBox}>
                  <Text style={styles.focusInitial}>
                    {area.slice(0, 1).toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={styles.bottomLabel}>FOCUS</Text>
          </View>
        )}

        {/* Branding */}
        <View style={styles.branding}>
          <Text style={styles.brandName}>PILARETA</Text>
          <Text style={styles.brandSub}>TRIBE</Text>
        </View>
      </View>
    </>
  );

  return (
    <View style={styles.cardOuter}>
      {imageUrl ? (
        <ImageBackground
          source={{ uri: imageUrl }}
          style={styles.card}
          imageStyle={styles.cardImageStyle}
        >
          <View style={styles.imageOverlay}>
            {cardContent}
          </View>
        </ImageBackground>
      ) : (
        <View style={styles.card}>
          <LinearGradient
            colors={['#262820', '#1e2018', '#2a2c22', '#1a1b15']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          {cardContent}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardOuter: {
    borderRadius: radius.lg + 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  card: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    padding: 24,
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(246, 237, 221, 0.15)',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 24,
    justifyContent: 'space-between',
  },
  cardImageStyle: {
    borderRadius: radius.lg,
  },
  radialDecor: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: '65%',
    height: '65%',
    backgroundColor: 'rgba(246, 237, 221, 0.04)',
    borderBottomLeftRadius: 999,
  },
  radialDecorBottom: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: '40%',
    height: '40%',
    backgroundColor: 'rgba(245, 158, 11, 0.03)',
    borderTopRightRadius: 999,
  },
  streakBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    zIndex: 1,
  },
  streakEmoji: {
    fontSize: 14,
  },
  streakText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.fg.primary,
  },
  topSection: {
    zIndex: 1,
  },
  topLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(245, 158, 11, 0.6)',
    letterSpacing: 2,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 15,
    color: 'rgba(246, 237, 221, 0.8)',
  },
  centerSection: {
    alignItems: 'center',
    paddingVertical: 16,
    zIndex: 1,
  },
  heroNumber: {
    fontSize: 68,
    fontWeight: '700',
    color: colors.fg.primary,
    lineHeight: 74,
    marginBottom: 4,
    letterSpacing: -1,
  },
  heroSubtext: {
    fontSize: 20,
    color: 'rgba(246, 237, 221, 0.7)',
    marginBottom: 8,
  },
  studioText: {
    fontSize: 14,
    color: 'rgba(246, 237, 221, 0.5)',
    marginTop: 4,
  },
  personalBestBadge: {
    position: 'absolute',
    top: 44,
    right: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    zIndex: 1,
  },
  personalBestText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent.amber,
  },
  focusChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    marginTop: 8,
  },
  focusChip: {
    backgroundColor: 'rgba(246, 237, 221, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  focusChipText: {
    fontSize: 10,
    color: 'rgba(246, 237, 221, 0.6)',
    fontWeight: '500',
  },
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(246, 237, 221, 0.12)',
    zIndex: 1,
  },
  bottomStat: {
    alignItems: 'center',
  },
  rpeCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  rpeNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  calNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.fg.primary,
    marginBottom: 2,
  },
  focusRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  focusBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: 'rgba(99, 102, 241, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  focusInitial: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.fg.primary,
  },
  bottomLabel: {
    fontSize: 10,
    color: 'rgba(246, 237, 221, 0.5)',
    letterSpacing: 0.5,
  },
  branding: {
    alignItems: 'flex-end',
  },
  brandName: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.fg.primary,
    letterSpacing: 2,
    opacity: 0.9,
  },
  brandSub: {
    fontSize: 10,
    color: 'rgba(245, 158, 11, 0.5)',
    letterSpacing: 2,
    fontWeight: '500',
  },
});
