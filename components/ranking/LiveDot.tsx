import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { colors } from '@/theme';

const LIVE_WINDOW_MS = 2 * 60 * 1000;

interface LiveDotProps {
  lastActiveAt: number;
}

export function LiveDot({ lastActiveAt }: LiveDotProps) {
  const isLive = Date.now() - lastActiveAt <= LIVE_WINDOW_MS;
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (!isLive) return;
    opacity.value = withRepeat(withSequence(withTiming(0.3, { duration: 700 }), withTiming(1, { duration: 700 })), -1, true);
  }, [isLive, opacity]);

  // Todos los hooks deben correr siempre en el mismo orden: el return
  // condicional va después de useAnimatedStyle, nunca antes.
  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  if (!isLive) return null;

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

const styles = StyleSheet.create({
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
});
