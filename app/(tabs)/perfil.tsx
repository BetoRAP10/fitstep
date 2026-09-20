import { useState } from 'react';
import { View, Text, StyleSheet, Switch, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, radius, spacing, fontFamily, fontSize, tabularNums } from '@/theme';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useDailyStatsStore } from '@/state/dailyStatsStore';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { SegmentedControl } from '@/components/auth/SegmentedControl';
import { Stepper } from '@/components/ui/Stepper';
import type { Sex } from '@/state/profileStore';

const SEX_LABEL: Record<Sex, string> = {
  male: 'Masculino',
  female: 'Femenino',
  unspecified: 'Prefiero no decir',
};

const SEX_OPTIONS: { label: string; value: Sex }[] = [
  { label: 'Masculino', value: 'male' },
  { label: 'Femenino', value: 'female' },
  { label: 'Prefiero no decir', value: 'unspecified' },
];

const QUICK_GOALS = [5000, 8000, 10000, 12000];

function formatHours(totalSeconds: number): string {
  const hours = totalSeconds / 3600;
  if (hours < 1) return `${Math.round(totalSeconds / 60)} min`;
  return `${hours.toFixed(1)} h`;
}

export default function PerfilScreen() {
  const { profile, updateProfile } = useProfile();
  const { signOut, biometricAvailable, biometricLockEnabled, setBiometricLockEnabled } = useAuth();
  const { totalSteps, bestDaySteps, streakDays, totalSecondsWalk, totalSecondsRun } = useDailyStatsStore();

  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [draftSex, setDraftSex] = useState<Sex>('unspecified');
  const [draftAge, setDraftAge] = useState(25);
  const [draftHeight, setDraftHeight] = useState(170);
  const [draftWeight, setDraftWeight] = useState(70);
  const [draftGoal, setDraftGoal] = useState(8000);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (!profile) return null;

  const startEditing = () => {
    setSaveError(null);
    setDraftName(profile.name);
    setDraftSex(profile.sex);
    setDraftAge(profile.age);
    setDraftHeight(profile.heightCm);
    setDraftWeight(profile.weightKg);
    setDraftGoal(profile.dailyGoalSteps);
    setEditing(true);
  };

  const saveEditing = async () => {
    try {
      await updateProfile({
        name: draftName.trim() || profile.name,
        sex: draftSex,
        age: draftAge,
        heightCm: draftHeight,
        weightKg: draftWeight,
        dailyGoalSteps: draftGoal,
      });
      setEditing(false);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'No pudimos guardar los cambios.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Perfil</Text>
          <Pressable onPress={editing ? saveEditing : startEditing} hitSlop={10}>
            <Text style={styles.editLink}>{editing ? 'Guardar' : 'Editar'}</Text>
          </Pressable>
        </View>

        {editing ? (
          <View style={styles.card}>
            <AuthTextField label="Nombre o apodo" value={draftName} onChangeText={setDraftName} />

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Sexo</Text>
              <SegmentedControl options={SEX_OPTIONS} value={draftSex} onChange={setDraftSex} />
            </View>

            <Stepper label="Edad" unit="años" value={draftAge} min={10} max={100} onChange={setDraftAge} />
            <Stepper label="Estatura" unit="cm" value={draftHeight} min={120} max={230} onChange={setDraftHeight} />
            <Stepper label="Peso" unit="kg" value={draftWeight} min={30} max={250} onChange={setDraftWeight} />

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Meta diaria</Text>
              <View style={styles.goalGrid}>
                {QUICK_GOALS.map((goal) => {
                  const selected = goal === draftGoal;
                  return (
                    <Pressable
                      key={goal}
                      onPress={() => setDraftGoal(goal)}
                      style={[styles.goalChip, selected && styles.goalChipSelected]}
                    >
                      <Text style={[styles.goalChipText, selected && styles.goalChipTextSelected]}>
                        {goal.toLocaleString('es-MX')}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            {saveError ? <Text style={styles.saveError}>{saveError}</Text> : null}
          </View>
        ) : (
          <View style={styles.card}>
            <Row label="Nombre" value={profile.name} />
            <Row label="Sexo" value={SEX_LABEL[profile.sex]} />
            <Row label="Edad" value={`${profile.age} años`} />
            <Row label="Estatura" value={`${profile.heightCm} cm`} />
            <Row label="Peso" value={`${profile.weightKg} kg`} />
            <Row label="Meta diaria" value={`${profile.dailyGoalSteps.toLocaleString('es-MX')} pasos`} />
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Estadísticas acumuladas</Text>
          <View style={styles.statsGrid}>
            <StatBlock label="Total de pasos" value={totalSteps.toLocaleString('es-MX')} />
            <StatBlock label="Mejor día" value={bestDaySteps.toLocaleString('es-MX')} />
            <StatBlock label="Racha" value={`${streakDays} ${streakDays === 1 ? 'día' : 'días'}`} />
            <StatBlock label="Caminando" value={formatHours(totalSecondsWalk)} />
            <StatBlock label="Corriendo" value={formatHours(totalSecondsRun)} />
          </View>
        </View>

        {biometricAvailable && (
          <View style={styles.card}>
            <View style={styles.switchRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchLabel}>Bloqueo con Face ID / huella</Text>
                <Text style={styles.switchHint}>Pide verificación al volver a abrir la app.</Text>
              </View>
              <Switch
                value={biometricLockEnabled}
                onValueChange={setBiometricLockEnabled}
                trackColor={{ false: colors.border, true: colors.accentMuted }}
                thumbColor={biometricLockEnabled ? colors.accent : colors.textSecondary}
              />
            </View>
          </View>
        )}

        <PrimaryButton label="Cerrar sesión" variant="secondary" onPress={signOut} style={styles.signOut} />
      </ScrollView>
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

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statBlock}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
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
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: fontFamily.displayBold,
    fontSize: fontSize.displayLg,
    color: colors.textPrimary,
  },
  editLink: {
    fontFamily: fontFamily.textSemiBold,
    fontSize: fontSize.md,
    color: colors.accent,
  },
  card: {
    padding: spacing.xl,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xl,
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
  fieldBlock: {
    gap: spacing.md,
  },
  fieldLabel: {
    fontFamily: fontFamily.textSemiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  goalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  goalChip: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  goalChipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  goalChipText: {
    fontFamily: fontFamily.textSemiBold,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    ...tabularNums,
  },
  goalChipTextSelected: {
    color: colors.textOnAccent,
  },
  sectionTitle: {
    fontFamily: fontFamily.textSemiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    marginTop: -spacing.md,
  },
  statBlock: {
    width: '30%',
  },
  statValue: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: fontSize.xl,
    color: colors.textPrimary,
    ...tabularNums,
  },
  statLabel: {
    fontFamily: fontFamily.textRegular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
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
  signOut: {
    marginTop: spacing.md,
  },
  saveError: {
    fontFamily: fontFamily.textRegular,
    fontSize: fontSize.sm,
    color: colors.danger,
  },
});
