import AsyncStorage from '@react-native-async-storage/async-storage';

export const STORAGE_KEYS = {
  profile: 'fitstep.profile',
  localAccounts: 'fitstep.localAccounts',
  localSession: 'fitstep.localSession',
  stepsByDay: (dateKey: string) => `fitstep.steps.${dateKey}`,
  bestDaySteps: 'fitstep.stats.bestDaySteps',
  streakDays: 'fitstep.stats.streakDays',
  lastGoalMetDate: 'fitstep.stats.lastGoalMetDate',
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
