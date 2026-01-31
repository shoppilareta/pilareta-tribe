import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, typography, spacing } from '@/theme';

export default function StudiosScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>Studios</Text>
        <Text style={styles.subtitle}>Studio locator and map - Phase 3</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  content: { flex: 1, padding: spacing.md, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: typography.sizes['2xl'], fontWeight: typography.weights.bold, color: colors.fg.primary, marginBottom: spacing.sm },
  subtitle: { fontSize: typography.sizes.base, color: colors.fg.tertiary, textAlign: 'center' },
});
