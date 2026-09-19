import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, spacing, fontFamily, fontSize } from '@/theme';
import type { ActivityState } from '@/constants/activity';

interface ActivityChipProps {
  activity: ActivityState;
}

const CONFIG: Record<ActivityState, { label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap; color: string }> = {
  still: { label: 'Inactivo', icon: 'pause', color: colors.textSecondary },
  walking: { label: 'Caminando', icon: 'walk', color: colors.accent },
  running: { label: 'Corriendo', icon: 'run', color: colors.accentSecondary },
};

export function ActivityChip({ activity }: ActivityChipProps) {
  const config = CONFIG[activity];
  return (
    <View style={styles.chip}>
      <MaterialCommunityIcons name={config.icon} size={12} color={config.color} />
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
    alignSelf: 'flex-start',
  },
  label: {
    fontFamily: fontFamily.textSemiBold,
    fontSize: fontSize.xs,
  },
});
