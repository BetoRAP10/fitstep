import { create } from 'zustand';
import { getJSON, setJSON, STORAGE_KEYS } from '@/services/storage';
import { todayKey, lastNDateKeys, addDays, parseDateKey } from '@/utils/date';
import type { MovementActivity } from '@/utils/calories';

export interface DailyStats {
  date: string;
  stepsWalk: number;
  stepsRun: number;
  secondsWalk: number;
  secondsRun: number;
  kcalMet: number;
  kcalStride: number;
}

const HISTORY_DAYS = 7;

function emptyStats(date: string): DailyStats {
  return { date, stepsWalk: 0, stepsRun: 0, secondsWalk: 0, secondsRun: 0, kcalMet: 0, kcalStride: 0 };
}

async function loadDay(date: string): Promise<DailyStats> {
  return (await getJSON<DailyStats>(STORAGE_KEYS.dailyStats(date))) ?? emptyStats(date);
}

function saveDay(stats: DailyStats): Promise<void> {
  return setJSON(STORAGE_KEYS.dailyStats(stats.date), stats);
}

function replaceInHistory(history: DailyStats[], updated: DailyStats): DailyStats[] {
  const index = history.findIndex((h) => h.date === updated.date);
  if (index === -1) return [...history.slice(1), updated];
  const next = [...history];
  next[index] = updated;
  return next;
}

interface DailyStatsState {
  today: DailyStats;
  history: DailyStats[];
  totalSteps: number;
  totalSecondsWalk: number;
  totalSecondsRun: number;
  bestDaySteps: number;
  streakDays: number;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  addSteps: (activity: MovementActivity, steps: number, kcalStride: number) => Promise<void>;
  addActiveSeconds: (activity: MovementActivity, seconds: number, kcalMet: number) => Promise<void>;
  evaluateGoal: (goalSteps: number) => Promise<boolean>;
}

function currentOrFreshToday(current: DailyStats): DailyStats {
  const date = todayKey();
  return current.date === date ? current : emptyStats(date);
}

export const useDailyStatsStore = create<DailyStatsState>((set, get) => ({
  today: emptyStats(todayKey()),
  history: [],
  totalSteps: 0,
  totalSecondsWalk: 0,
  totalSecondsRun: 0,
  bestDaySteps: 0,
  streakDays: 0,
  isHydrated: false,

  hydrate: async () => {
    const keys = lastNDateKeys(HISTORY_DAYS);
    const [history, totalSteps, totalSecondsWalk, totalSecondsRun, bestDaySteps, streakDays] = await Promise.all([
      Promise.all(keys.map(loadDay)),
      getJSON<number>(STORAGE_KEYS.totalSteps).then((v) => v ?? 0),
      getJSON<number>(STORAGE_KEYS.totalSecondsWalk).then((v) => v ?? 0),
      getJSON<number>(STORAGE_KEYS.totalSecondsRun).then((v) => v ?? 0),
      getJSON<number>(STORAGE_KEYS.bestDaySteps).then((v) => v ?? 0),
      getJSON<number>(STORAGE_KEYS.streakDays).then((v) => v ?? 0),
    ]);
    const today = history[history.length - 1] ?? emptyStats(todayKey());
    set({ today, history, totalSteps, totalSecondsWalk, totalSecondsRun, bestDaySteps, streakDays, isHydrated: true });
  },

  addSteps: async (activity, steps, kcalStride) => {
    if (steps <= 0) return;
    const base = currentOrFreshToday(get().today);
    const next: DailyStats = {
      ...base,
      stepsWalk: base.stepsWalk + (activity === 'walking' ? steps : 0),
      stepsRun: base.stepsRun + (activity === 'running' ? steps : 0),
      kcalStride: base.kcalStride + kcalStride,
    };
    await saveDay(next);

    const totalSteps = get().totalSteps + steps;
    await setJSON(STORAGE_KEYS.totalSteps, totalSteps);

    const todayTotalSteps = next.stepsWalk + next.stepsRun;
    let bestDaySteps = get().bestDaySteps;
    if (todayTotalSteps > bestDaySteps) {
      bestDaySteps = todayTotalSteps;
      await setJSON(STORAGE_KEYS.bestDaySteps, bestDaySteps);
    }

    set((state) => ({ today: next, totalSteps, bestDaySteps, history: replaceInHistory(state.history, next) }));
  },

  addActiveSeconds: async (activity, seconds, kcalMet) => {
    if (seconds <= 0) return;
    const base = currentOrFreshToday(get().today);
    const next: DailyStats = {
      ...base,
      secondsWalk: base.secondsWalk + (activity === 'walking' ? seconds : 0),
      secondsRun: base.secondsRun + (activity === 'running' ? seconds : 0),
      kcalMet: base.kcalMet + kcalMet,
    };
    await saveDay(next);

    const totalSecondsWalk = get().totalSecondsWalk + (activity === 'walking' ? seconds : 0);
    const totalSecondsRun = get().totalSecondsRun + (activity === 'running' ? seconds : 0);
    if (activity === 'walking') await setJSON(STORAGE_KEYS.totalSecondsWalk, totalSecondsWalk);
    if (activity === 'running') await setJSON(STORAGE_KEYS.totalSecondsRun, totalSecondsRun);

    set((state) => ({
      today: next,
      totalSecondsWalk,
      totalSecondsRun,
      history: replaceInHistory(state.history, next),
    }));
  },

  evaluateGoal: async (goalSteps) => {
    const today = get().today;
    const totalStepsToday = today.stepsWalk + today.stepsRun;
    if (totalStepsToday < goalSteps) return false;

    const lastMetDate = await getJSON<string>(STORAGE_KEYS.lastGoalMetDate);
    if (lastMetDate === today.date) return false;

    const yesterdayKey = todayKey(addDays(parseDateKey(today.date), -1));
    const streak = lastMetDate === yesterdayKey ? get().streakDays + 1 : 1;

    await setJSON(STORAGE_KEYS.lastGoalMetDate, today.date);
    await setJSON(STORAGE_KEYS.streakDays, streak);
    set({ streakDays: streak });
    return true;
  },
}));
