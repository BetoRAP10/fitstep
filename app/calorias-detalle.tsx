import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, radius, spacing, fontFamily, fontSize, tabularNums } from '@/theme';
import { useDailyStatsStore } from '@/state/dailyStatsStore';

function formatKcal(value: number): string {
  return `${Math.round(value).toLocaleString('es-MX')}`;
}

export default function CaloriasDetalle() {
  const router = useRouter();
  const today = useDailyStatsStore((s) => s.today);
  const diff = Math.abs(today.kcalMet - today.kcalStride);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Tus calorías, dos maneras</Text>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.close}>
          <Feather name="x" size={22} color={colors.textPrimary} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, styles.officialCard]}>
          <Text style={styles.cardEyebrow}>Método oficial · MET</Text>
          <Text style={styles.cardValue}>{formatKcal(today.kcalMet)} kcal</Text>
          <Text style={styles.cardBody}>
            Combina tu peso con la intensidad real de tu movimiento (MET), acumulada segundo a segundo. Es el número
            que ves en Hoy y el que se sube al ranking.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>Comparativo · Pasos-zancada</Text>
          <Text style={styles.cardValueSecondary}>{formatKcal(today.kcalStride)} kcal</Text>
          <Text style={styles.cardBody}>
            Estima el costo de cada paso según tu estatura y tu peso. Es una referencia simple, pero no distingue tu
            esfuerzo real como el MET.
          </Text>
        </View>

        <View style={styles.diffRow}>
          <Feather name="git-branch" size={16} color={colors.textSecondary} />
          <Text style={styles.diffText}>Diferencia entre ambos métodos: {formatKcal(diff)} kcal</Text>
        </View>

        <Text style={styles.explanation}>
          El MET incluye el gasto de tu cuerpo en reposo además del movimiento; la zancada mide solo el costo de
          desplazarte. Por eso casi siempre difieren, y por eso el MET es el que usamos como oficial.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
  },
  title: {
    flex: 1,
    fontFamily: fontFamily.displayBold,
    fontSize: fontSize.display,
    color: colors.textPrimary,
  },
  close: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
  },
  card: {
    padding: spacing.xl,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  officialCard: {
    borderColor: colors.accent,
  },
  cardEyebrow: {
    fontFamily: fontFamily.textSemiBold,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardValue: {
    fontFamily: fontFamily.displayBold,
    fontSize: fontSize.displayLg,
    color: colors.accent,
    marginTop: spacing.xs,
    ...tabularNums,
  },
  cardValueSecondary: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: fontSize.display,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    ...tabularNums,
  },
  cardBody: {
    fontFamily: fontFamily.textRegular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  diffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  diffText: {
    fontFamily: fontFamily.textMedium,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  explanation: {
    fontFamily: fontFamily.textRegular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
