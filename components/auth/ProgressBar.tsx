import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '@/theme';

interface ProgressBarProps {
  total: number;
  current: number;
}

export function ProgressBar({ total, current }: ProgressBarProps) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, index) => (
        <View
          key={index}
          style={[styles.bar, index === current ? styles.barActive : styles.barInactive]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  bar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  barActive: {
    backgroundColor: colors.accent,
  },
  barInactive: {
    backgroundColor: colors.border,
  },
});
