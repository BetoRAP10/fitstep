import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { colors, spacing, fontFamily, fontSize } from '@/theme';
import { todayKey, weekdayLabel } from '@/utils/date';
import type { DailyStats } from '@/state/dailyStatsStore';

const CHART_HEIGHT = 110;
const BAR_WIDTH = 40;

interface WeekStackedBarChartProps {
  data: DailyStats[];
}

export function WeekStackedBarChart({ data }: WeekStackedBarChartProps) {
  const maxTotal = Math.max(...data.map((d) => d.stepsWalk + d.stepsRun), 1);
  const currentKey = todayKey();

  return (
    <View style={styles.row}>
      {data.map((day) => (
        <DayBar key={day.date} stats={day} maxTotal={maxTotal} isToday={day.date === currentKey} />
      ))}
    </View>
  );
}

function DayBar({ stats, maxTotal, isToday }: { stats: DailyStats; maxTotal: number; isToday: boolean }) {
  const total = stats.stepsWalk + stats.stepsRun;
  const walkHeight = (stats.stepsWalk / maxTotal) * CHART_HEIGHT;
  const runHeight = (stats.stepsRun / maxTotal) * CHART_HEIGHT;
  const opacity = isToday ? 1 : 0.5;

  return (
    <View style={styles.column}>
      <Svg width="100%" height={CHART_HEIGHT} viewBox={`0 0 100 ${CHART_HEIGHT}`} preserveAspectRatio="none">
        {total === 0 ? (
          <Rect x={30} y={CHART_HEIGHT - 4} width={BAR_WIDTH} height={4} rx={2} fill={colors.border} />
        ) : (
          <>
            <Rect
              x={30}
              y={CHART_HEIGHT - walkHeight - runHeight}
              width={BAR_WIDTH}
              height={runHeight}
              fill={colors.accentSecondary}
              opacity={opacity}
            />
            <Rect
              x={30}
              y={CHART_HEIGHT - walkHeight}
              width={BAR_WIDTH}
              height={walkHeight}
              fill={colors.accent}
              opacity={opacity}
            />
          </>
        )}
      </Svg>
      <Text style={[styles.label, isToday && styles.labelActive]}>{weekdayLabel(stats.date)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontFamily: fontFamily.textMedium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  labelActive: {
    color: colors.textPrimary,
    fontFamily: fontFamily.textSemiBold,
  },
});
