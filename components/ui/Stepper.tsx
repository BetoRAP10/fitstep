import { useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing, fontFamily, fontSize, tabularNums } from '@/theme';

interface StepperProps {
  label: string;
  unit: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

const REPEAT_DELAY_MS = 350;
const REPEAT_INTERVAL_MS = 80;

export function Stepper({ label, unit, value, min, max, step = 1, onChange }: StepperProps) {
  const valueRef = useRef(value);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const applyDelta = (delta: number) => {
    const next = Math.min(max, Math.max(min, valueRef.current + delta));
    if (next !== valueRef.current) {
      valueRef.current = next;
      Haptics.selectionAsync();
      onChange(next);
    }
  };

  const clearTimers = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startRepeat = (delta: number) => {
    applyDelta(delta);
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => applyDelta(delta), REPEAT_INTERVAL_MS);
    }, REPEAT_DELAY_MS);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Pressable
          onPressIn={() => startRepeat(-step)}
          onPressOut={clearTimers}
          disabled={value <= min}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
            value <= min && styles.buttonDisabled,
          ]}
        >
          <Feather name="minus" size={20} color={colors.textPrimary} />
        </Pressable>

        <View style={styles.valueBox}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>

        <Pressable
          onPressIn={() => startRepeat(step)}
          onPressOut={clearTimers}
          disabled={value >= max}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
            value >= max && styles.buttonDisabled,
          ]}
        >
          <Feather name="plus" size={20} color={colors.textPrimary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  label: {
    fontFamily: fontFamily.textSemiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: colors.border,
  },
  buttonDisabled: {
    opacity: 0.35,
  },
  valueBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  value: {
    fontFamily: fontFamily.displayBold,
    fontSize: fontSize.displayLg,
    color: colors.textPrimary,
    ...tabularNums,
  },
  unit: {
    fontFamily: fontFamily.textMedium,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
});
