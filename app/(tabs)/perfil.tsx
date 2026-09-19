import { View, Text, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontFamily, fontSize, tabularNums } from '@/theme';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import type { Sex } from '@/state/profileStore';

const SEX_LABEL: Record<Sex, string> = {
  male: 'Masculino',
  female: 'Femenino',
  unspecified: 'Prefiero no decir',
};

export default function PerfilScreen() {
  const { profile, setDemoMode } = useProfile();
  const { signOut } = useAuth();

  if (!profile) return null;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
        <Text style={styles.subtitle}>Edición completa disponible en la fase 6.</Text>
      </View>

      <View style={styles.card}>
        <Row label="Nombre" value={profile.name} />
        <Row label="Sexo" value={SEX_LABEL[profile.sex]} />
        <Row label="Edad" value={`${profile.age} años`} />
        <Row label="Estatura" value={`${profile.heightCm} cm`} />
        <Row label="Peso" value={`${profile.weightKg} kg`} />
        <Row label="Meta diaria" value={`${profile.dailyGoalSteps.toLocaleString('es-MX')} pasos`} />
      </View>

      <View style={styles.card}>
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchLabel}>Modo demo</Text>
            <Text style={styles.switchHint}>Simula pasos para probar la app sin caminar.</Text>
          </View>
          <Switch
            value={profile.demoModeEnabled}
            onValueChange={setDemoMode}
            trackColor={{ false: colors.border, true: colors.accentMuted }}
            thumbColor={profile.demoModeEnabled ? colors.accent : colors.textSecondary}
          />
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton label="Cerrar sesión" variant="secondary" onPress={signOut} />
      </View>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
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
  },
  card: {
    marginHorizontal: spacing.xxl,
    marginTop: spacing.xl,
    padding: spacing.xl,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    fontFamily: fontFamily.textRegular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  rowValue: {
    fontFamily: fontFamily.textSemiBold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
    ...tabularNums,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  switchLabel: {
    fontFamily: fontFamily.textSemiBold,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  switchHint: {
    fontFamily: fontFamily.textRegular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    marginTop: 'auto',
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.lg,
  },
});
