export const colors = {
  background: '#0B0F0C',
  surface: '#141A16',
  surfaceElevated: '#1C231E',
  border: '#263029',

  accent: '#C6F432',
  accentMuted: '#8FAE2A',
  accentSecondary: '#FF6B4A',

  textPrimary: '#F4F6F1',
  textSecondary: '#8A948C',
  textOnAccent: '#0B0F0C',

  success: '#5FD68B',
  danger: '#FF6B4A',
} as const;

export type ColorToken = keyof typeof colors;
