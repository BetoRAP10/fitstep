import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing, fontFamily, fontSize, tabularNums } from '@/theme';
import { Avatar } from '@/components/ui/Avatar';
import { ActivityChip } from '@/components/ranking/ActivityChip';
import type { RankingEntry } from '@/services/ranking';

interface PodiumProps {
  entries: RankingEntry[];
}

export function Podium({ entries }: PodiumProps) {
  const [first, second, third] = entries;

  return (
    <View style={styles.row}>
      {second && <Slot entry={second} place={2} />}
      {first && <Slot entry={first} place={1} />}
      {third && <Slot entry={third} place={3} />}
    </View>
  );
}

function Slot({ entry, place }: { entry: RankingEntry; place: 1 | 2 | 3 }) {
  const isFirst = place === 1;

  return (
    <View style={[styles.slot, isFirst && styles.slotFirst]}>
      <View style={[styles.placeBadge, isFirst && styles.placeBadgeFirst]}>
        <Text style={[styles.placeText, isFirst && styles.placeTextFirst]}>{place}</Text>
      </View>
      <Avatar id={entry.userId} name={entry.name} size={isFirst ? 76 : 58} ringed={isFirst} />
      <Text style={[styles.name, isFirst && styles.nameFirst]} numberOfLines={1}>
        {entry.name.split(' ')[0]}
      </Text>
      <Text style={styles.kcal}>{entry.kcal.toLocaleString('es-MX')} kcal</Text>
      <ActivityChip activity={entry.activity} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: spacing.md,
    paddingTop: spacing.xl,
  },
  slot: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  slotFirst: {
    paddingBottom: spacing.xxl,
  },
  placeBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeBadgeFirst: {
    backgroundColor: colors.accent,
  },
  placeText: {
    fontFamily: fontFamily.textSemiBold,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    ...tabularNums,
  },
  placeTextFirst: {
    color: colors.textOnAccent,
  },
  name: {
    fontFamily: fontFamily.textSemiBold,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    maxWidth: 90,
  },
  nameFirst: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: fontSize.lg,
  },
  kcal: {
    fontFamily: fontFamily.textMedium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    ...tabularNums,
  },
});
