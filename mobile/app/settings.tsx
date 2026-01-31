import { View, Text, StyleSheet, Pressable, Switch, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';
import { useAuthStore } from '@/stores/authStore';
import { useHealth } from '@/hooks/useHealth';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsScreen() {
  const { user, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();
  const health = useHealth();
  const notifications = useNotifications();

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.dismissAll();
          router.replace('/(tabs)/track');
        },
      },
    ]);
  };

  const handleHealthToggle = async () => {
    const result = await health.toggle();
    if (!result && !health.enabled) {
      Alert.alert(
        'Permission Required',
        'Please grant health data access in your device settings to enable this feature.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.closeText}>Close</Text>
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Account */}
        {isAuthenticated && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.card}>
              <View style={styles.profileRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(user?.firstName?.[0] || user?.email?.[0] || '?').toUpperCase()}
                  </Text>
                </View>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>
                    {user?.firstName} {user?.lastName}
                  </Text>
                  <Text style={styles.profileEmail}>{user?.email}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIconRow}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.fg.secondary} strokeWidth={1.5}>
                    <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                  <Text style={styles.settingLabel}>Streak Reminders</Text>
                </View>
                <Text style={styles.settingDesc}>
                  Daily reminder at 7pm to log your workout
                </Text>
              </View>
              <Switch
                value={notifications.streakReminderEnabled}
                onValueChange={notifications.toggleStreakReminder}
                trackColor={{ false: colors.border.default, true: colors.semantic.success }}
                thumbColor={colors.fg.primary}
              />
            </View>
          </View>
        </View>

        {/* Health Integration */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Integration</Text>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={styles.settingIconRow}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.fg.secondary} strokeWidth={1.5}>
                    <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                  <Text style={styles.settingLabel}>
                    {health.available ? 'Sync with Health' : 'Health Sync'}
                  </Text>
                </View>
                <Text style={styles.settingDesc}>
                  {health.available
                    ? 'Sync pilates workouts with Apple Health / Health Connect'
                    : 'Not available — requires a native build (not Expo Go)'}
                </Text>
              </View>
              <Switch
                value={health.enabled}
                onValueChange={handleHealthToggle}
                disabled={!health.available || health.loading}
                trackColor={{ false: colors.border.default, true: colors.semantic.success }}
                thumbColor={health.available ? colors.fg.primary : colors.fg.disabled}
              />
            </View>
            {health.enabled && health.authorized && (
              <View style={styles.statusRow}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Connected and syncing</Text>
              </View>
            )}
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Version</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.aboutRow}>
              <Text style={styles.aboutLabel}>Platform</Text>
              <Text style={styles.aboutValue}>Pilareta Tribe</Text>
            </View>
          </View>
        </View>

        {/* Sign out */}
        {isAuthenticated && (
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  closeText: { fontSize: typography.sizes.base, color: colors.fg.secondary },
  title: { fontSize: typography.sizes.md, fontWeight: typography.weights.semibold, color: colors.fg.primary },
  scroll: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: 60 },
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.fg.tertiary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.md,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.cream10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.fg.primary,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: typography.sizes.sm,
    color: colors.fg.tertiary,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  settingLabel: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colors.fg.primary,
  },
  settingDesc: {
    fontSize: typography.sizes.sm,
    color: colors.fg.tertiary,
    lineHeight: 18,
    marginLeft: 26, // align with label text (icon width + gap)
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.semantic.success,
  },
  statusText: {
    fontSize: typography.sizes.sm,
    color: colors.semantic.success,
  },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  aboutLabel: {
    fontSize: typography.sizes.base,
    color: colors.fg.secondary,
  },
  aboutValue: {
    fontSize: typography.sizes.base,
    color: colors.fg.tertiary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.default,
    marginVertical: spacing.sm,
  },
  logoutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  logoutText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: '#ef4444',
  },
});
