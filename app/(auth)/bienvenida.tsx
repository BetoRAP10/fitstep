import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, radius, fontFamily, fontSize } from '@/theme';
import { PrimaryButton } from '@/components/ui/PrimaryButton';

export default function Bienvenida() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.mark}>
          <Feather name="activity" size={28} color={colors.textOnAccent} />
        </View>

        <View style={styles.copy}>
          <Text style={styles.title}>FitStep</Text>
          <Text style={styles.subtitle}>Tus pasos, tu ritmo, tu lugar en la tabla.</Text>
        </View>

        <View style={styles.actions}>
          <PrimaryButton label="Crear cuenta" onPress={() => router.push('/(auth)/registro/cuenta')} />
          <PrimaryButton
            label="Iniciar sesión"
            variant="secondary"
            onPress={() => router.push('/(auth)/login')}
          />
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
    justifyContent: 'space-between',
  },
  mark: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.huge,
  },
  copy: {
    marginTop: spacing.huge,
  },
  title: {
    fontFamily: fontFamily.displayBold,
    fontSize: fontSize.displayXl,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fontFamily.textRegular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  actions: {
    gap: spacing.md,
  },
});
