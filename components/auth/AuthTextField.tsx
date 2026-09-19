import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, TextInputProps } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { colors, radius, spacing, fontFamily, fontSize } from '@/theme';

interface AuthTextFieldProps
  extends Pick<
    TextInputProps,
    'autoComplete' | 'textContentType' | 'keyboardType' | 'autoCapitalize' | 'returnKeyType' | 'onSubmitEditing'
  > {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string | null;
  secureToggle?: boolean;
}

export function AuthTextField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureToggle = false,
  ...inputProps
}: AuthTextFieldProps) {
  const [secure, setSecure] = useState(secureToggle);
  const focusProgress = useSharedValue(0);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(focusProgress.value, [0, 1], [colors.border, colors.accent]),
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View style={[styles.inputRow, borderStyle]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
          secureTextEntry={secure}
          onFocus={() => {
            focusProgress.value = withTiming(1, { duration: 150 });
          }}
          onBlur={() => {
            focusProgress.value = withTiming(0, { duration: 150 });
          }}
          {...inputProps}
        />
        {secureToggle && (
          <Pressable onPress={() => setSecure((s) => !s)} hitSlop={8}>
            <Feather name={secure ? 'eye' : 'eye-off'} size={20} color={colors.textSecondary} />
          </Pressable>
        )}
      </Animated.View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  label: {
    fontFamily: fontFamily.textSemiBold,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.lg,
    height: 52,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.textMedium,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  error: {
    fontFamily: fontFamily.textRegular,
    fontSize: fontSize.xs,
    color: colors.danger,
  },
});
