import { useEffect, useState, useCallback } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts as useBarlowCondensedFonts,
  BarlowCondensed_500Medium,
  BarlowCondensed_600SemiBold,
  BarlowCondensed_700Bold,
} from '@expo-google-fonts/barlow-condensed';
import {
  useFonts as useInterFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { colors } from '@/theme';
import { useAuthStore } from '@/state/authStore';
import { useProfileStore } from '@/state/profileStore';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [barlowLoaded] = useBarlowCondensedFonts({
    BarlowCondensed_500Medium,
    BarlowCondensed_600SemiBold,
    BarlowCondensed_700Bold,
  });
  const [interLoaded] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const isAuthHydrated = useAuthStore((s) => s.isHydrated);
  const hydrateProfile = useProfileStore((s) => s.hydrate);
  const isProfileHydrated = useProfileStore((s) => s.isHydrated);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    hydrateAuth();
    hydrateProfile();
  }, [hydrateAuth, hydrateProfile]);

  useEffect(() => {
    if (barlowLoaded && interLoaded && isAuthHydrated && isProfileHydrated) {
      setAppReady(true);
    }
  }, [barlowLoaded, interLoaded, isAuthHydrated, isProfileHydrated]);

  const onLayoutRootView = useCallback(() => {
    if (appReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [appReady]);

  if (!appReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: colors.background }} onLayout={onLayoutRootView}>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="bloqueo" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="calorias-detalle"
            options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
          />
        </Stack>
      </View>
    </SafeAreaProvider>
  );
}
