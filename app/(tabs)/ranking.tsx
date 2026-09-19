import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontFamily, fontSize } from '@/theme';
import { useRanking } from '@/hooks/useRanking';
import { useAuth } from '@/hooks/useAuth';
import { SegmentedControl } from '@/components/auth/SegmentedControl';
import { Podium } from '@/components/ranking/Podium';
import { RankingRow } from '@/components/ranking/RankingRow';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import type { RankingPeriod } from '@/services/ranking';

const PERIOD_OPTIONS: { label: string; value: RankingPeriod }[] = [
  { label: 'Hoy', value: 'today' },
  { label: 'Semana', value: 'week' },
  { label: 'Mes', value: 'month' },
];

const PIN_THRESHOLD = 5;

export default function RankingScreen() {
  const [period, setPeriod] = useState<RankingPeriod>('today');
  const { entries, isLoading, isRefreshing, refresh } = useRanking(period);
  const { session } = useAuth();

  const podium = entries.slice(0, 3);
  const rest = entries.slice(3);
  const currentUserIndex = entries.findIndex((e) => e.isCurrentUser);
  const currentUserEntry = currentUserIndex >= 0 ? entries[currentUserIndex] : null;
  const shouldPin = currentUserEntry !== null && currentUserIndex >= PIN_THRESHOLD;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Ranking</Text>
        <Text style={styles.subtitle}>Compárate con el resto por calorías quemadas.</Text>
      </View>

      <View style={styles.filterWrap}>
        <SegmentedControl options={PERIOD_OPTIONS} value={period} onChange={setPeriod} />
      </View>

      {isLoading ? (
        <View style={styles.skeletonList}>
          <Skeleton height={180} radius={20} />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height={60} radius={16} />
          ))}
        </View>
      ) : entries.length === 0 ? (
        <EmptyState
          icon="bar-chart-2"
          title="Todavía no hay datos"
          body="En cuanto haya actividad registrada, aquí aparecerá la tabla de posiciones."
        />
      ) : (
        <FlatList
          data={rest}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refresh} tintColor={colors.accent} />}
          ListHeaderComponent={<Podium entries={podium} />}
          renderItem={({ item, index }) => (
            <RankingRow entry={item} position={index + 4} highlighted={item.isCurrentUser} />
          )}
        />
      )}

      {shouldPin && currentUserEntry && (
        <View style={styles.pinnedWrap}>
          <RankingRow entry={currentUserEntry} position={currentUserIndex + 1} highlighted />
        </View>
      )}
    </SafeAreaView>
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
  filterWrap: {
    paddingHorizontal: spacing.xxl,
    marginTop: spacing.lg,
  },
  skeletonList: {
    paddingHorizontal: spacing.xxl,
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  pinnedWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
});
