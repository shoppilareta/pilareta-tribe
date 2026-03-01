import { useState, useEffect, Component, type ReactNode } from 'react';
import { View, Text, StyleSheet, Pressable, Switch, Alert, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { colors, typography, spacing, radius } from '@/theme';
import { useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/hooks/useAuth';
import { getStats } from '@/api/track';
import { getFollowers, getFollowing } from '@/api/social';

// Error boundary to prevent settings crash if a hook/module fails
class SettingsErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <SafeAreaView style={styles.container} edges={['top']}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()}>
              <Text style={styles.closeText}>Close</Text>
            </Pressable>
            <Text style={styles.title}>Account</Text>
            <View style={{ width: 50 }} />
          </View>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
            <Text style={{ color: colors.fg.primary, fontSize: typography.sizes.lg, marginBottom: spacing.sm }}>Something went wrong</Text>
            <Text style={{ color: colors.fg.tertiary, fontSize: typography.sizes.sm, textAlign: 'center' }}>Settings could not be loaded. Please restart the app.</Text>
          </View>
        </SafeAreaView>
      );
    }
    return this.props.children;
  }
}

// Safe hook loaders — return null if the hook module can't load
function useSafeHealth() {
  try {
    const { useHealth } = require('@/hooks/useHealth');
    return useHealth();
  } catch {
    return { available: false, enabled: false, authorized: false, loading: false, toggle: async () => false };
  }
}

function useSafeNotifications() {
  try {
    const { useNotifications } = require('@/hooks/useNotifications');
    return useNotifications();
  } catch {
    return { streakReminderEnabled: false, toggleStreakReminder: () => {} };
  }
}

function SettingsContent() {
  const { user, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();
  const health = useSafeHealth();
  const notifications = useSafeNotifications();

  // Fetch stats and social counts
  const [stats, setStats] = useState<{ currentStreak: number; totalWorkouts: number; totalMinutes: number } | null>(null);
  const [socialCounts, setSocialCounts] = useState<{ followers: number; following: number } | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    getStats().then((data) => {
      setStats({ currentStreak: data.stats.currentStreak, totalWorkouts: data.stats.totalWorkouts, totalMinutes: data.stats.totalMinutes });
    }).catch(() => {});
    Promise.all([
      getFollowers(user.id, { limit: 1 }).catch(() => null),
      getFollowing(user.id, { limit: 1 }).catch(() => null),
    ]).then(([frs, fwg]) => {
      // Use hasMore + returned count as approximation if count isn't returned directly
      setSocialCounts({ followers: frs?.followers?.length ?? 0, following: fwg?.following?.length ?? 0 });
    });
  }, [isAuthenticated, user?.id]);

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.dismissAll();
          router.replace('/(tabs)/shop');
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
        <Text style={styles.title}>Account</Text>
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
              <View style={styles.divider} />
              <Pressable
                style={styles.contactRow}
                onPress={() => router.push('/profile')}
              >
                <View style={styles.settingIconRow}>
                  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.fg.secondary} strokeWidth={1.5}>
                    <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                  <Text style={styles.settingLabel}>Edit Profile</Text>
                </View>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.fg.tertiary} strokeWidth={2}>
                  <Path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </Pressable>
            </View>
          </View>
        )}

        {/* Your Stats */}
        {isAuthenticated && stats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Stats</Text>
            <View style={styles.card}>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.currentStreak}</Text>
                  <Text style={styles.statLabel}>Day Streak</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{stats.totalWorkouts}</Text>
                  <Text style={styles.statLabel}>Workouts</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{Math.round(stats.totalMinutes / 60)}h</Text>
                  <Text style={styles.statLabel}>Total Time</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Friends */}
        {isAuthenticated && socialCounts && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Friends</Text>
            <View style={styles.card}>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{socialCounts.followers}</Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{socialCounts.following}</Text>
                  <Text style={styles.statLabel}>Following</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Orders — always visible */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shopping</Text>
          <View style={styles.card}>
            <Pressable
              style={styles.contactRow}
              onPress={() => {
                if (isAuthenticated) {
                  router.push('/orders');
                } else {
                  router.push('/auth/login');
                }
              }}
            >
              <View style={styles.settingIconRow}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.fg.secondary} strokeWidth={1.5}>
                  <Path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={styles.settingLabel}>Your Orders</Text>
              </View>
              <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.fg.tertiary} strokeWidth={2}>
                <Path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </Pressable>
          </View>
        </View>

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

        {/* Contact Us */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.card}>
            <Pressable
              style={styles.contactRow}
              onPress={() => Linking.openURL('https://wa.me/919910220744?text=Hi%20Pilareta')}
            >
              <View style={styles.settingIconRow}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.fg.secondary} strokeWidth={1.5}>
                  <Path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={styles.settingLabel}>WhatsApp</Text>
              </View>
              <Text style={styles.contactHint}>Chat with us</Text>
            </Pressable>
            <View style={styles.divider} />
            <Pressable
              style={styles.contactRow}
              onPress={() => Linking.openURL('mailto:shop@pilareta.com')}
            >
              <View style={styles.settingIconRow}>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.fg.secondary} strokeWidth={1.5}>
                  <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" strokeLinecap="round" strokeLinejoin="round" />
                  <Path d="M22 6l-10 7L2 6" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
                <Text style={styles.settingLabel}>Email</Text>
              </View>
              <Text style={styles.contactHint}>shop@pilareta.com</Text>
            </Pressable>
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

export default function SettingsScreen() {
  return (
    <SettingsErrorBoundary>
      <SettingsContent />
    </SettingsErrorBoundary>
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
    marginLeft: 26,
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
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  contactHint: {
    fontSize: typography.sizes.sm,
    color: colors.fg.tertiary,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.fg.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: colors.fg.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
