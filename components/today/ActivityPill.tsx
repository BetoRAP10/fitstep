import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, radius, spacing, fontFamily, fontSize } from '@/theme';
import type { ActivityState } from '@/constants/activity';

interface ActivityPillProps {
  state: ActivityState;
  cadence: number;
}

const STATE_INDEX: Record<ActivityState, number> = { still: 0, walking: 1, running: 2 };
const STATE_COLORS = [colors.textSecondary, colors.accent, colors.accentSecondary];
const STATE_ICONS: Record<ActivityState, keyof typeof MaterialCommunityIcons.glyphMap> = {
  still: 'pause',
  walking: 'walk',
  running: 'run',
};

function labelFor(state: ActivityState, cadence: number): string {
  if (state === 'still') return 'Quieto';
  const spm = Math.round(cadence);
  return state === 'walking' ? `Caminando · ${spm} pasos/min` : `Corriendo · ${spm} pasos/min`;
}

const AnimatedIcon = Animated.createAnimatedComponent(MaterialCommunityIcons);

export function ActivityPill({ state, cadence }: ActivityPillProps) {
  const progress = useSharedValue(STATE_INDEX[state]);

  useEffect(() => {
    progress.value = withTiming(STATE_INDEX[state], { duration: 400 });
  }, [state, progress]);

  const tintStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1, 2], STATE_COLORS),
  }));

  return (
    <Animated.View style={styles.pill}>
      <AnimatedIcon name={STATE_ICONS[state]} size={18} style={tintStyle} />
      <Animated.Text style={[styles.label, tintStyle]}>{labelFor(state, cadence)}</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontFamily: fontFamily.textSemiBold,
    fontSize: fontSize.sm,
  },
});
