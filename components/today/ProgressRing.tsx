import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { colors, spacing, fontFamily, fontSize, tabularNums } from '@/theme';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ProgressRingProps {
  steps: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
  celebrate?: boolean;
}

export function ProgressRing({ steps, goal, size = 260, strokeWidth = 18, celebrate = false }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(0);
  const scale = useSharedValue(1);
  const ratio = goal > 0 ? Math.min(steps / goal, 1) : 0;
  const reached = steps >= goal && goal > 0;
  const remaining = Math.max(goal - steps, 0);

  useEffect(() => {
    progress.value = withTiming(ratio, { duration: 900, easing: Easing.out(Easing.cubic) });
  }, [ratio, progress]);

  useEffect(() => {
    if (celebrate) {
      scale.value = withSequence(
        withTiming(1.04, { duration: 220, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 260, easing: Easing.inOut(Easing.quad) })
      );
    }
  }, [celebrate, scale]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.container, { width: size, height: size }, pulseStyle]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.surfaceElevated}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={reached ? colors.accent : colors.accent}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      <View style={styles.center}>
        <AnimatedNumber value={steps} style={styles.steps} />
        <Text style={styles.goal}>de {goal.toLocaleString('es-MX')} pasos</Text>
        {reached ? (
          <Text style={styles.reachedLabel}>Meta cumplida</Text>
        ) : (
          <Text style={styles.remainingLabel}>Te faltan {remaining.toLocaleString('es-MX')}</Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  center: {
    alignItems: 'center',
  },
  steps: {
    fontFamily: fontFamily.displayBold,
    fontSize: fontSize.displayXl,
    color: colors.textPrimary,
    ...tabularNums,
  },
  goal: {
    fontFamily: fontFamily.textMedium,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  remainingLabel: {
    fontFamily: fontFamily.textSemiBold,
    fontSize: fontSize.sm,
    color: colors.accent,
    marginTop: spacing.sm,
  },
  reachedLabel: {
    fontFamily: fontFamily.textSemiBold,
    fontSize: fontSize.sm,
    color: colors.accent,
    marginTop: spacing.sm,
  },
});
