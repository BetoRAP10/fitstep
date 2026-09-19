import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radius, spacing, fontFamily, fontSize, tabularNums } from '@/theme';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';

interface MetricCardProps {
  label: string;
  value: number;
  unit: string;
  icon: keyof typeof Feather.glyphMap;
  formatter?: (n: number) => string;
}

export function MetricCard({ label, value, unit, icon, formatter }: MetricCardProps) {
  return (
    <View style={styles.card}>
      <Feather name={icon} size={16} color={colors.textSecondary} />
      <AnimatedNumber value={value} formatter={formatter} style={styles.value} />
      <Text style={styles.unit}>{unit}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: 2,
  },
  value: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: fontSize.display,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    ...tabularNums,
  },
  unit: {
    fontFamily: fontFamily.textRegular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  label: {
    fontFamily: fontFamily.textMedium,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
