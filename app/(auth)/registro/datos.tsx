import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, fontFamily, fontSize } from '@/theme';
import { ProgressBar } from '@/components/auth/ProgressBar';
import { SegmentedControl } from '@/components/auth/SegmentedControl';
import { Stepper } from '@/components/ui/Stepper';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useRegistrationDraftStore } from '@/state/registrationDraftStore';
import type { Sex } from '@/state/profileStore';

const SEX_OPTIONS: { label: string; value: Sex }[] = [
  { label: 'Masculino', value: 'male' },
  { label: 'Femenino', value: 'female' },
  { label: 'Prefiero no decir', value: 'unspecified' },
];

export default function RegistroDatos() {
  const router = useRouter();
  const { sex, age, heightCm, weightKg, setBodyData } = useRegistrationDraftStore();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
            <Feather name="chevron-left" size={24} color={colors.textPrimary} />
          </Pressable>
          <ProgressBar total={3} current={1} />
        </View>

        <View style={styles.body}>
          <Text style={styles.eyebrow}>Paso 2 de 3</Text>
          <Text style={styles.title}>Datos corporales</Text>
          <Text style={styles.subtitle}>Los usamos para calcular distancia y calorías con precisión.</Text>

          <View style={styles.sexBlock}>
            <Text style={styles.sexLabel}>Sexo</Text>
            <SegmentedControl options={SEX_OPTIONS} value={sex} onChange={(v) => setBodyData(v, age, heightCm, weightKg)} />
          </View>

          <View style={styles.steppers}>
            <Stepper
              label="Edad"
              unit="años"
              value={age}
              min={10}
              max={100}
              onChange={(v) => setBodyData(sex, v, heightCm, weightKg)}
            />
            <Stepper
              label="Estatura"
              unit="cm"
              value={heightCm}
              min={120}
              max={230}
              onChange={(v) => setBodyData(sex, age, v, weightKg)}
            />
            <Stepper
              label="Peso"
              unit="kg"
              value={weightKg}
              min={30}
              max={250}
              onChange={(v) => setBodyData(sex, age, heightCm, v)}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label="Continuar" onPress={() => router.push('/(auth)/registro/meta')} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
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
    marginTop: spacing.xxxl,
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
  sexBlock: {
    marginTop: spacing.xxxl,
    gap: spacing.md,
  },
  sexLabel: {
    fontFamily: fontFamily.textSemiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  steppers: {
    marginTop: spacing.xxxl,
    gap: spacing.xxxl,
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
  },
});
