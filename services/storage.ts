import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  profile: 'fitstep.profile',
  localAccounts: 'fitstep.localAccounts',
  localSession: 'fitstep.localSession',
  // Ligadas al usuario: dos cuentas en el mismo dispositivo no deben
  // heredarse pasos, calorías ni rachas entre sí.
  stepsByDay: (userId: string, dateKey: string) => `fitstep.steps.${userId}.${dateKey}`,
  dailyStats: (userId: string, dateKey: string) => `fitstep.dailyStats.${userId}.${dateKey}`,
  totalSteps: (userId: string) => `fitstep.stats.${userId}.totalSteps`,
  totalSecondsWalk: (userId: string) => `fitstep.stats.${userId}.totalSecondsWalk`,
  totalSecondsRun: (userId: string) => `fitstep.stats.${userId}.totalSecondsRun`,
  bestDaySteps: (userId: string) => `fitstep.stats.${userId}.bestDaySteps`,
  streakDays: (userId: string) => `fitstep.stats.${userId}.streakDays`,
  lastGoalMetDate: (userId: string) => `fitstep.stats.${userId}.lastGoalMetDate`,
  biometricLockEnabled: 'fitstep.biometricLockEnabled',
} as const;

export async function getJSON<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (raw === null) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setJSON<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}
