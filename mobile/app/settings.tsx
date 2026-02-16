import { View, Text, StyleSheet, Pressable, Switch, Alert, ScrollView, Linking } from 'react-native';
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

        {/* Orders */}
        {isAuthenticated && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shopping</Text>
            <View style={styles.card}>
              <Pressable
                style={styles.contactRow}
                onPress={() => router.push('/orders')}
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
        )}

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
