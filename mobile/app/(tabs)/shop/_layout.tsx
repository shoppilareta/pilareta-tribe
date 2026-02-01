import { Stack } from 'expo-router';
import { colors } from '@/theme';

export default function ShopLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg.primary },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="[handle]"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="cart"
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
    </Stack>
  );
}
