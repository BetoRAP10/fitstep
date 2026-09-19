import { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, radius, spacing, fontFamily, fontSize } from '@/theme';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { authenticateWithBiometrics } from '@/services/biometrics';

export default function Bloqueo() {
  const router = useRouter();
  const { isAuthenticated, isUnlocked, unlock, signOut } = useAuth();
  const { profile } = useProfile();
  const [status, setStatus] = useState<'idle' | 'checking' | 'failed'>('idle');

  const tryUnlock = useCallback(async () => {
    setStatus('checking');
    const ok = await authenticateWithBiometrics('Ingresa a FitStep');
    if (ok) {
      unlock();
    } else {
      setStatus('failed');
    }
  }, [unlock]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/(auth)/bienvenida');
      return;
    }
    if (isUnlocked) {
      router.replace('/(tabs)');
      return;
    }
    tryUnlock();
    // Solo al montar: no queremos relanzar el prompt en cada re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isUnlocked) router.replace('/(tabs)');
  }, [isUnlocked, router]);

  const handleUsePassword = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.mark}>
          <Feather name="lock" size={26} color={colors.textOnAccent} />
        </View>

        <Text style={styles.title}>Hola{profile ? `, ${profile.name}` : ''}</Text>
        <Text style={styles.subtitle}>
          {status === 'failed'
            ? 'No pudimos verificarte. Intenta de nuevo.'
            : 'Verifica tu identidad para entrar a tu cuenta.'}
        </Text>

        <View style={styles.actions}>
          <PrimaryButton label="Desbloquear" onPress={tryUnlock} disabled={status === 'checking'} />
          <PrimaryButton label="Usar mi correo y contraseña" variant="secondary" onPress={handleUsePassword} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xl,
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  mark: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.huge,
    alignSelf: 'flex-start',
  },
  title: {
    fontFamily: fontFamily.displayBold,
    fontSize: fontSize.displayLg,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fontFamily.textRegular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  actions: {
    gap: spacing.md,
  },
});
