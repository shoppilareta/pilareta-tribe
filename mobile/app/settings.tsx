import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, typography, spacing, radius } from '@/theme';

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.closeText}>Close</Text>
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <Text style={styles.cardText}>Sign out, profile settings - coming soon</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Integration</Text>
          <View style={styles.card}>
            <Text style={styles.cardText}>HealthKit / Health Connect sync - Phase 4</Text>
          </View>
        </View>
      </View>
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
  content: { flex: 1, padding: spacing.md },
  section: { marginBottom: spacing.xl },
  sectionTitle: { fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold, color: colors.fg.tertiary, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 1 },
  card: { backgroundColor: colors.bg.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border.default, padding: spacing.md },
  cardText: { fontSize: typography.sizes.base, color: colors.fg.secondary },
});
