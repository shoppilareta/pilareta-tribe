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
        name="wishlist"
        options={{ headerShown: false, animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="cart"
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="checkout"
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="order-confirmation"
        options={{ headerShown: false, animation: 'fade', gestureEnabled: false }}
      />
    </Stack>
  );
}
