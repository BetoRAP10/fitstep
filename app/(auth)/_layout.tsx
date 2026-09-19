import { Redirect, Stack } from 'expo-router';
import { useAuthStore } from '@/state/authStore';
import { colors } from '@/theme';

export default function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="bienvenida" />
      <Stack.Screen name="login" />
      <Stack.Screen name="recuperar" />
      <Stack.Screen name="registro" />
    </Stack>
  );
}
