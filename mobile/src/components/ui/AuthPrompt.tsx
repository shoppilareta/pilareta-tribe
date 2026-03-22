import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, typography, spacing, radius } from '@/theme';

interface AuthPromptProps {
  action: string; // e.g., "save favorites", "track workouts", "post to community"
}

export function AuthPrompt({ action }: AuthPromptProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Sign in to {action}</Text>
      <Pressable
        style={styles.button}
        onPress={() => router.push('/auth/login')}
        accessibilityRole="button"
        accessibilityLabel={`Sign in to ${action}`}
      >
        <Text style={styles.buttonText}>Sign In</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  text: {
    fontSize: typography.sizes.base,
    color: colors.fg.secondary,
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.button.primaryBg,
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: spacing.xl,
  },
  buttonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semibold,
    color: colors.button.primaryText,
  },
});
