import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontFamily, fontSize } from '@/theme';
import { useProfile } from '@/hooks/useProfile';
import { useActivityContext } from '@/components/providers/ActivityProvider';
import { useDailyStatsStore } from '@/state/dailyStatsStore';
import { strideLengthMeters } from '@/utils/calories';
import { formatLongDateEs } from '@/utils/date';
import { ProgressRing } from '@/components/today/ProgressRing';
import { ActivityPill } from '@/components/today/ActivityPill';
import { MetricCard } from '@/components/today/MetricCard';
import { ActivityBreakdownBar } from '@/components/today/ActivityBreakdownBar';
import { WeekStackedBarChart } from '@/components/today/WeekStackedBarChart';
import { CaloriesInfoCard } from '@/components/today/CaloriesInfoCard';
import { PermissionState } from '@/components/today/PermissionState';
import { Skeleton } from '@/components/ui/Skeleton';

export default function HoyScreen() {
  const { profile } = useProfile();
  const activity = useActivityContext();
  const { today, history, isHydrated: statsHydrated } = useDailyStatsStore();

  if (!profile) return null;

  const totalSteps = today.stepsWalk + today.stepsRun;
  const distanceKm =
    (strideLengthMeters(profile.heightCm, 'walking', profile.sex) * today.stepsWalk +
      strideLengthMeters(profile.heightCm, 'running', profile.sex) * today.stepsRun) /
    1000;
  const activeMinutes = (today.secondsWalk + today.secondsRun) / 60;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Hola, {profile.name}</Text>
          <Text style={styles.date}>{formatLongDateEs()}</Text>
        </View>

        {activity.permissionStatus === 'checking' ? (
          <View style={styles.skeletonBlock}>
            <Skeleton height={260} radius={130} style={styles.skeletonRing} />
            <Skeleton height={36} width={180} radius={18} />
          </View>
        ) : activity.permissionStatus === 'denied' || activity.permissionStatus === 'unavailable' ? (
          <PermissionState status={activity.permissionStatus} onRetry={activity.requestPermission} />
        ) : (
          <>
            <View style={styles.ringBlock}>
              <ProgressRing steps={totalSteps} goal={profile.dailyGoalSteps} celebrate={activity.goalJustReached} />
              <View style={styles.pillWrap}>
                <ActivityPill state={activity.state} cadence={activity.cadence} />
              </View>
            </View>

            <View style={styles.metricsRow}>
              <MetricCard
                label="Calorías"
                value={today.kcalMet}
                unit="kcal"
                icon="zap"
                formatter={(n) => Math.round(n).toLocaleString('es-MX')}
              />
              <MetricCard
                label="Distancia"
                value={Math.round(distanceKm * 100)}
                unit="km"
                icon="map-pin"
                formatter={(n) => (n / 100).toFixed(2)}
              />
              <MetricCard
                label="Min. activos"
                value={activeMinutes}
                unit="min"
                icon="clock"
                formatter={(n) => Math.round(n).toLocaleString('es-MX')}
              />
            </View>

            <View style={styles.card}>
              <ActivityBreakdownBar
                title="Pasos de hoy"
                walk={{
                  label: 'Caminando',
                  value: today.stepsWalk,
                  displayValue: today.stepsWalk.toLocaleString('es-MX'),
                  color: colors.accent,
                }}
                run={{
                  label: 'Corriendo',
                  value: today.stepsRun,
                  displayValue: today.stepsRun.toLocaleString('es-MX'),
                  color: colors.accentSecondary,
                }}
              />
            </View>

            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Últimos 7 días</Text>
              {statsHydrated && history.length === 7 ? (
                <WeekStackedBarChart data={history} />
              ) : (
                <Skeleton height={110} />
              )}
            </View>

            <CaloriesInfoCard />
          </>
        )}
      </ScrollView>
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
    paddingBottom: spacing.xxxl,
    gap: spacing.xl,
  },
  header: {
    marginBottom: spacing.sm,
  },
  greeting: {
    fontFamily: fontFamily.displayBold,
    fontSize: fontSize.displayLg,
    color: colors.textPrimary,
  },
  date: {
    fontFamily: fontFamily.textRegular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textTransform: 'capitalize',
  },
  skeletonBlock: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.xxxl,
  },
  skeletonRing: {
    alignSelf: 'center',
  },
  ringBlock: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  pillWrap: {
    alignItems: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  card: {
    padding: spacing.xl,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontFamily: fontFamily.textSemiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.lg,
  },
});
