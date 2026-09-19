import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { useAuthStore } from '@/state/authStore';
import { ActivityProvider } from '@/components/providers/ActivityProvider';
import { CustomTabBar } from '@/components/tabbar/CustomTabBar';

export default function TabsLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/bienvenida" />;
  }

  return (
    <ActivityProvider>
      <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="index" options={{ title: 'Hoy' }} />
        <Tabs.Screen name="ranking" options={{ title: 'Ranking' }} />
        <Tabs.Screen name="perfil" options={{ title: 'Perfil' }} />
      </Tabs>
    </ActivityProvider>
  );
}
