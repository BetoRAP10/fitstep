import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing, fontFamily, fontSize, tabularNums } from '@/theme';
import { ProgressBar } from '@/components/auth/ProgressBar';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useRegistrationDraftStore } from '@/state/registrationDraftStore';
import { useAuth } from '@/hooks/useAuth';

const QUICK_GOALS = [5000, 8000, 10000, 12000];

export default function RegistroMeta() {
  const router = useRouter();
  const { signUp, isSubmitting, error, clearError } = useAuth();
  const draft = useRegistrationDraftStore();
  const { dailyGoalSteps, setDailyGoal, reset } = draft;

  const handleFinish = async () => {
    clearError();
    const ok = await signUp({
      name: draft.name,
      email: draft.email,
      password: draft.password,
      sex: draft.sex,
      age: draft.age,
      heightCm: draft.heightCm,
      weightKg: draft.weightKg,
      dailyGoalSteps,
    });
    if (ok) {
      reset();
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
            <Feather name="chevron-left" size={24} color={colors.textPrimary} />
          </Pressable>
          <ProgressBar total={3} current={2} />
        </View>

        <View style={styles.body}>
          <Text style={styles.eyebrow}>Paso 3 de 3</Text>
          <Text style={styles.title}>Tu meta diaria</Text>
          <Text style={styles.subtitle}>Puedes cambiarla cuando quieras desde tu perfil.</Text>

          <View style={styles.grid}>
            {QUICK_GOALS.map((goal) => {
              const selected = goal === dailyGoalSteps;
              return (
                <Pressable
                  key={goal}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setDailyGoal(goal);
                  }}
                  style={[styles.chip, selected && styles.chipSelected]}
                >
                  <Text style={[styles.chipValue, selected && styles.chipValueSelected]}>
                    {goal.toLocaleString('es-MX')}
                  </Text>
                  <Text style={[styles.chipUnit, selected && styles.chipUnitSelected]}>pasos</Text>
                </Pressable>
              );
            })}
          </View>

          {error ? <Text style={styles.serverError}>{error}</Text> : null}
        </View>

        <PrimaryButton
          label={isSubmitting ? 'Creando cuenta…' : 'Empezar'}
          onPress={handleFinish}
          disabled={isSubmitting}
        />
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
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  back: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  body: {
    marginTop: spacing.huge,
  },
  eyebrow: {
    fontFamily: fontFamily.textSemiBold,
    fontSize: fontSize.sm,
    color: colors.accent,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fontFamily.displayBold,
    fontSize: fontSize.displayLg,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  subtitle: {
    fontFamily: fontFamily.textRegular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  grid: {
    marginTop: spacing.xxxl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  chip: {
    width: '47%',
    paddingVertical: spacing.lg,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  chipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipValue: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
    ...tabularNums,
  },
  chipValueSelected: {
    color: colors.textOnAccent,
  },
  chipUnit: {
    fontFamily: fontFamily.textRegular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  chipUnitSelected: {
    color: colors.textOnAccent,
  },
  serverError: {
    marginTop: spacing.lg,
    fontFamily: fontFamily.textRegular,
    fontSize: fontSize.sm,
    color: colors.danger,
  },
});
