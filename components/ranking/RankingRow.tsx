import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radius, spacing, fontFamily, fontSize, tabularNums } from '@/theme';
import { Avatar } from '@/components/ui/Avatar';
import { ActivityChip } from '@/components/ranking/ActivityChip';
import { LiveDot } from '@/components/ranking/LiveDot';
import type { RankingEntry } from '@/services/ranking';

interface RankingRowProps {
  entry: RankingEntry;
  position: number;
  highlighted?: boolean;
}

export function RankingRow({ entry, position, highlighted = false }: RankingRowProps) {
  return (
    <View style={[styles.row, highlighted && styles.rowHighlighted]}>
      <Text style={styles.position}>{position}</Text>
      <Avatar id={entry.userId} name={entry.name} size={40} />

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {entry.name}
          </Text>
          <LiveDot lastActiveAt={entry.lastActiveAt} />
        </View>
        <ActivityChip activity={entry.activity} />
      </View>

      <View style={styles.rightCol}>
        <Text style={styles.kcal}>{entry.kcal.toLocaleString('es-MX')}</Text>
        <DeltaIndicator delta={entry.deltaRank} />
      </View>
    </View>
  );
}

function DeltaIndicator({ delta }: { delta: number }) {
  if (delta === 0) {
    return <Feather name="minus" size={12} color={colors.textSecondary} />;
  }
  const up = delta > 0;
  const color = up ? colors.accent : colors.accentSecondary;
  return (
    <View style={styles.deltaRow}>
      <Feather name={up ? 'arrow-up' : 'arrow-down'} size={12} color={color} />
      <Text style={[styles.deltaText, { color }]}>{Math.abs(delta)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
  },
  rowHighlighted: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  position: {
    width: 20,
    fontFamily: fontFamily.textSemiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    ...tabularNums,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    flexShrink: 1,
    fontFamily: fontFamily.textSemiBold,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  kcal: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    ...tabularNums,
  },
  deltaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  deltaText: {
    fontFamily: fontFamily.textSemiBold,
    fontSize: fontSize.xs,
    ...tabularNums,
  },
});
