import { Redirect } from 'expo-router';
import { useAuthStore } from '@/state/authStore';

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isUnlocked = useAuthStore((s) => s.isUnlocked);

  if (!isAuthenticated) return <Redirect href="/(auth)/bienvenida" />;
  if (!isUnlocked) return <Redirect href="/bloqueo" />;
  return <Redirect href="/(tabs)" />;
}
