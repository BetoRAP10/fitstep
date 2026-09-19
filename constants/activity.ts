export type ActivityState = 'still' | 'walking' | 'running';

// Umbrales de detección de actividad. Todos ajustables sin tocar la lógica
// en hooks/useActivity.ts (fase c).
export const ACTIVITY_THRESHOLDS = {
  stillCadenceBelow: 50,
  stillNoStepsSeconds: 10,
  walkingCadenceMin: 50,
  walkingCadenceMax: 139,
  runningCadenceAbove: 140,
  runningHighIntensityCadenceAbove: 130,
  cadenceWindowSeconds: 15,
  cadenceSmoothingSeconds: 30,
  accelerometerIntervalMs: 50,
  accelerometerWindowSeconds: 2,
  hysteresisSeconds: 8,
} as const;
