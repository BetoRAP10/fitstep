import type { ActivityState } from '@/constants/activity';
import type { Sex } from '@/state/profileStore';
import {
  STRIDE_COEFFICIENT_WALKING,
  STRIDE_COEFFICIENT_RUNNING,
  STRIDE_FACTOR_WALKING_MALE,
  STRIDE_FACTOR_WALKING_FEMALE,
  STRIDE_FACTOR_WALKING_UNSPECIFIED,
  STRIDE_FACTOR_RUNNING,
  MET_STILL,
} from '@/constants/calories';
import { WALKING_MET_TABLE, RUNNING_MET_TABLE } from '@/constants/met';

export type MovementActivity = Extract<ActivityState, 'walking' | 'running'>;

/** Interpola linealmente `x` en una tabla de puntos [x, y] ordenada, fijando
 * el valor a los extremos fuera de rango en vez de extrapolar. */
function interpolate(table: [number, number][], x: number): number {
  if (x <= table[0][0]) return table[0][1];
  const last = table[table.length - 1];
  if (x >= last[0]) return last[1];

  for (let i = 0; i < table.length - 1; i++) {
    const [x0, y0] = table[i];
    const [x1, y1] = table[i + 1];
    if (x >= x0 && x <= x1) {
      const t = (x - x0) / (x1 - x0);
      return y0 + t * (y1 - y0);
    }
  }
  return last[1];
}

// --- Método 1: pasos-zancada ---

export function strideLengthMeters(heightCm: number, activity: MovementActivity, sex: Sex): number {
  const heightM = heightCm / 100;
  if (activity === 'running') return heightM * STRIDE_FACTOR_RUNNING;

  const factor =
    sex === 'male'
      ? STRIDE_FACTOR_WALKING_MALE
      : sex === 'female'
        ? STRIDE_FACTOR_WALKING_FEMALE
        : STRIDE_FACTOR_WALKING_UNSPECIFIED;
  return heightM * factor;
}

export function strideCalories(
  steps: number,
  strideMeters: number,
  weightKg: number,
  activity: MovementActivity
): number {
  const coefficient = activity === 'running' ? STRIDE_COEFFICIENT_RUNNING : STRIDE_COEFFICIENT_WALKING;
  return steps * strideMeters * weightKg * coefficient;
}

// --- Método 2: MET ---

export function metForCadence(activity: ActivityState, cadence: number): number {
  if (activity === 'still') return MET_STILL;
  const table = activity === 'running' ? RUNNING_MET_TABLE : WALKING_MET_TABLE;
  return interpolate(table, cadence);
}

export function metCalories(met: number, weightKg: number, hours: number): number {
  return met * weightKg * hours;
}

/** Calorías MET acumuladas en un intervalo corto (uso típico: cada segundo,
 * sumando MET(actividad, cadencia) × peso / 3600 al total del día). */
export function metCaloriesForSeconds(met: number, weightKg: number, seconds: number): number {
  return metCalories(met, weightKg, seconds / 3600);
}
