export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

// Solo tres radios en todo el sistema: control pequeño, tarjeta, superficie grande.
export const radius = {
  sm: 12,
  md: 20,
  lg: 28,
} as const;

export type SpacingToken = keyof typeof spacing;
export type RadiusToken = keyof typeof radius;
