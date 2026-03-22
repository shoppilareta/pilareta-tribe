import { Stack } from 'expo-router';
import { colors } from '@/theme';

export default function StudiosLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg.primary },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="favorites" options={{ headerShown: false, animation: 'slide_from_right' }} />
    </Stack>
  );
}
