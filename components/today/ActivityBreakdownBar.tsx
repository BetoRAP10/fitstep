import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, fontFamily, fontSize, tabularNums } from '@/theme';

interface BreakdownItem {
  label: string;
  value: number;
  displayValue: string;
  color: string;
}

interface ActivityBreakdownBarProps {
  title: string;
  walk: BreakdownItem;
  run: BreakdownItem;
}

export function ActivityBreakdownBar({ title, walk, run }: ActivityBreakdownBarProps) {
  const total = walk.value + run.value;
  const walkFlex = total > 0 ? walk.value : 1;
  const runFlex = total > 0 ? run.value : 1;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.track}>
        <View style={[styles.segment, { flex: walkFlex, backgroundColor: total > 0 ? walk.color : colors.border }]} />
        <View style={[styles.segment, { flex: runFlex, backgroundColor: total > 0 ? run.color : colors.border }]} />
      </View>

      <View style={styles.legendRow}>
        <LegendEntry item={walk} />
        <LegendEntry item={run} />
      </View>
    </View>
  );
}

function LegendEntry({ item }: { item: BreakdownItem }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: item.color }]} />
      <Text style={styles.legendLabel}>{item.label}</Text>
      <Text style={styles.legendValue}>{item.displayValue}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  title: {
    fontFamily: fontFamily.textSemiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  track: {
    flexDirection: 'row',
    height: 10,
    borderRadius: radius.sm,
    overflow: 'hidden',
    gap: 3,
  },
  segment: {
    borderRadius: radius.sm,
  },
  legendRow: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontFamily: fontFamily.textRegular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  legendValue: {
    fontFamily: fontFamily.textSemiBold,
    fontSize: fontSize.xs,
    color: colors.textPrimary,
    ...tabularNums,
  },
});
