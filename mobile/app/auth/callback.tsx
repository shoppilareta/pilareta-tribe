import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { colors, typography } from '@/theme';

export default function AuthCallback() {
  const params = useLocalSearchParams<{ code?: string; state?: string; error?: string }>();

  useEffect(() => {
    // OAuth callback handling will be implemented in Task #5
    // For now, just redirect to track
    const timer = setTimeout(() => {
      router.replace('/(tabs)/track');
    }, 1000);
    return () => clearTimeout(timer);
  }, [params]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.fg.primary} />
      <Text style={styles.text}>Signing in...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: 16,
    fontSize: typography.sizes.md,
    color: colors.fg.secondary,
  },
});
