// Nombres de familia tal como los registra expo-font vía @expo-google-fonts.
export const fontFamily = {
  displayBold: 'BarlowCondensed_700Bold',
  displaySemiBold: 'BarlowCondensed_600SemiBold',
  displayMedium: 'BarlowCondensed_500Medium',
  textRegular: 'Inter_400Regular',
  textMedium: 'Inter_500Medium',
  textSemiBold: 'Inter_600SemiBold',
} as const;

// Escala tipográfica única para todo el sistema.
export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  display: 30,
  displayLg: 44,
  displayXl: 72,
} as const;

// Los números protagonistas (pasos, kcal) usan tabular-nums para no "bailar" al animarse.
export const tabularNums: { fontVariant: ('tabular-nums' | 'lining-nums')[] } = {
  fontVariant: ['tabular-nums', 'lining-nums'],
};
