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
let writeQueue: Promise<void> = Promise.resolve();

function queueWrite(operation: () => Promise<void>): Promise<void> {
  writeQueue = writeQueue.then(operation, operation);
  return writeQueue;
}

function emptyStats(date: string): DailyStats {
  return { date, stepsWalk: 0, stepsRun: 0, secondsWalk: 0, secondsRun: 0, kcalMet: 0, kcalStride: 0 };
}

async function loadDay(userId: string, date: string): Promise<DailyStats> {
  return (await getJSON<DailyStats>(STORAGE_KEYS.dailyStats(userId, date))) ?? emptyStats(date);
}

function saveDay(userId: string, stats: DailyStats): Promise<void> {
  return queueWrite(() => setJSON(STORAGE_KEYS.dailyStats(userId, stats.date), stats));
}

function replaceInHistory(history: DailyStats[], updated: DailyStats): DailyStats[] {
  const index = history.findIndex((h) => h.date === updated.date);
  if (index === -1) return [...history.slice(1), updated];
  const next = [...history];
  next[index] = updated;
  return next;
}

interface DailyStatsState {
  userId: string | null;
  today: DailyStats;
  history: DailyStats[];
  totalSteps: number;
  totalSecondsWalk: number;
  totalSecondsRun: number;
  bestDaySteps: number;
  streakDays: number;
  isHydrated: boolean;
  hydrate: (userId: string) => Promise<void>;
  reconcilePedometerSteps: (pedometerSteps: number, activity: MovementActivity, kcalStridePerStep: number) => Promise<void>;
  addSteps: (activity: MovementActivity, steps: number, kcalStride: number) => Promise<void>;
  addActiveSeconds: (activity: MovementActivity, seconds: number, kcalMet: number) => Promise<void>;
  evaluateGoal: (goalSteps: number) => Promise<boolean>;
}

function currentOrFreshToday(current: DailyStats): DailyStats {
  const date = todayKey();
  return current.date === date ? current : emptyStats(date);
}

export const useDailyStatsStore = create<DailyStatsState>((set, get) => ({
  userId: null,
  today: emptyStats(todayKey()),
  history: [],
  totalSteps: 0,
  totalSecondsWalk: 0,
  totalSecondsRun: 0,
  bestDaySteps: 0,
  streakDays: 0,
  isHydrated: false,

  // Cambiar de cuenta en el mismo dispositivo debe traer los datos de ESA
  // cuenta, no seguir mostrando los de la anterior: por eso se recarga por
  // completo cada vez que cambia el userId, en vez de hidratar una sola vez.
  hydrate: async (userId: string) => {
    if (get().userId === userId && get().isHydrated) return;
    // Evita mostrar por un instante los números de la cuenta anterior
    // mientras se cargan los de la nueva.
    if (get().userId !== userId) {
      set({
        userId,
        isHydrated: false,
        today: emptyStats(todayKey()),
        history: [],
        totalSteps: 0,
        totalSecondsWalk: 0,
        totalSecondsRun: 0,
        bestDaySteps: 0,
        streakDays: 0,
      });
    }

    const keys = lastNDateKeys(HISTORY_DAYS);
    const [history, totalSteps, totalSecondsWalk, totalSecondsRun, bestDaySteps, streakDays] = await Promise.all([
      Promise.all(keys.map((date) => loadDay(userId, date))),
      getJSON<number>(STORAGE_KEYS.totalSteps(userId)).then((v) => v ?? 0),
      getJSON<number>(STORAGE_KEYS.totalSecondsWalk(userId)).then((v) => v ?? 0),
      getJSON<number>(STORAGE_KEYS.totalSecondsRun(userId)).then((v) => v ?? 0),
      getJSON<number>(STORAGE_KEYS.bestDaySteps(userId)).then((v) => v ?? 0),
      getJSON<number>(STORAGE_KEYS.streakDays(userId)).then((v) => v ?? 0),
    ]);
    const today = history[history.length - 1] ?? emptyStats(todayKey());
    set({
      userId,
      today,
      history,
      totalSteps,
      totalSecondsWalk,
      totalSecondsRun,
      bestDaySteps,
      streakDays,
      isHydrated: true,
    });
  },

  addSteps: async (activity, steps, kcalStride) => {
    const userId = get().userId;
    if (!userId || steps <= 0) return;

    const base = currentOrFreshToday(get().today);
    const next: DailyStats = {
      ...base,
      stepsWalk: base.stepsWalk + (activity === 'walking' ? steps : 0),
      stepsRun: base.stepsRun + (activity === 'running' ? steps : 0),
      kcalStride: base.kcalStride + kcalStride,
    };
    const totalSteps = get().totalSteps + steps;

    const todayTotalSteps = next.stepsWalk + next.stepsRun;
    let bestDaySteps = get().bestDaySteps;
    if (todayTotalSteps > bestDaySteps) {
      bestDaySteps = todayTotalSteps;
    }

    set((state) => ({ today: next, totalSteps, bestDaySteps, history: replaceInHistory(state.history, next) }));
    await Promise.all([
      saveDay(userId, next),
      queueWrite(() => setJSON(STORAGE_KEYS.totalSteps(userId), totalSteps)),
      queueWrite(() => setJSON(STORAGE_KEYS.bestDaySteps(userId), bestDaySteps)),
    ]);
  },

  reconcilePedometerSteps: async (pedometerSteps, activity, kcalStridePerStep) => {
    const userId = get().userId;
    if (!userId || pedometerSteps <= 0) return;

    const base = currentOrFreshToday(get().today);
    const recorded = base.stepsWalk + base.stepsRun;
    const delta = pedometerSteps - recorded;
    if (delta <= 0) return;

    const next: DailyStats = {
      ...base,
      stepsWalk: base.stepsWalk + (activity === 'walking' ? delta : 0),
      stepsRun: base.stepsRun + (activity === 'running' ? delta : 0),
      kcalStride: base.kcalStride + delta * kcalStridePerStep,
    };
    const totalSteps = get().totalSteps + delta;
    const todayTotalSteps = next.stepsWalk + next.stepsRun;
    const bestDaySteps = Math.max(get().bestDaySteps, todayTotalSteps);

    set((state) => ({ today: next, totalSteps, bestDaySteps, history: replaceInHistory(state.history, next) }));
    await Promise.all([
      saveDay(userId, next),
      queueWrite(() => setJSON(STORAGE_KEYS.totalSteps(userId), totalSteps)),
      queueWrite(() => setJSON(STORAGE_KEYS.bestDaySteps(userId), bestDaySteps)),
    ]);
  },

  addActiveSeconds: async (activity, seconds, kcalMet) => {
    const userId = get().userId;
    if (!userId || seconds <= 0) return;

    const base = currentOrFreshToday(get().today);
    const next: DailyStats = {
      ...base,
      secondsWalk: base.secondsWalk + (activity === 'walking' ? seconds : 0),
      secondsRun: base.secondsRun + (activity === 'running' ? seconds : 0),
      kcalMet: base.kcalMet + kcalMet,
    };
    const totalSecondsWalk = get().totalSecondsWalk + (activity === 'walking' ? seconds : 0);
    const totalSecondsRun = get().totalSecondsRun + (activity === 'running' ? seconds : 0);

    set((state) => ({
      today: next,
      totalSecondsWalk,
      totalSecondsRun,
      history: replaceInHistory(state.history, next),
    }));
    await Promise.all([
      saveDay(userId, next),
      activity === 'walking'
        ? queueWrite(() => setJSON(STORAGE_KEYS.totalSecondsWalk(userId), totalSecondsWalk))
        : Promise.resolve(),
      activity === 'running'
        ? queueWrite(() => setJSON(STORAGE_KEYS.totalSecondsRun(userId), totalSecondsRun))
        : Promise.resolve(),
    ]);
  },

  evaluateGoal: async (goalSteps) => {
    const userId = get().userId;
    if (!userId) return false;

    const today = get().today;
    const totalStepsToday = today.stepsWalk + today.stepsRun;
    if (totalStepsToday < goalSteps) return false;

    const lastMetDate = await getJSON<string>(STORAGE_KEYS.lastGoalMetDate(userId));
    if (lastMetDate === today.date) return false;

    const yesterdayKey = todayKey(addDays(parseDateKey(today.date), -1));
    const streak = lastMetDate === yesterdayKey ? get().streakDays + 1 : 1;

    await setJSON(STORAGE_KEYS.lastGoalMetDate(userId), today.date);
    await setJSON(STORAGE_KEYS.streakDays(userId), streak);
    set({ streakDays: streak });
    return true;
  },
}));
