import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { rankingService, type RankingEntry, type RankingPeriod } from '@/services/ranking';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useActivityContext } from '@/components/providers/ActivityProvider';
import { useDailyStatsStore } from '@/state/dailyStatsStore';

const POLL_INTERVAL_MS = 20_000;
const SUBMIT_CHECK_INTERVAL_MS = 5_000;
const SUBMIT_MIN_INTERVAL_MS = 15_000;
const SUBMIT_MAX_INTERVAL_MS = 60_000;

export function useRanking(period: RankingPeriod) {
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { session } = useAuth();
  const { profile } = useProfile();
  const activity = useActivityContext();
  const today = useDailyStatsStore((s) => s.today);

  const load = useCallback(
    async (silent = false) => {
      if (!silent) setIsLoading(true);
      const data = await rankingService.getRanking(period, session?.userId);
      setEntries(data);
      if (!silent) setIsLoading(false);
    },
    [period, session?.userId]
  );

  useEffect(() => {
    load();
  }, [load]);

  // Sin Realtime en Expo Go: se refresca a los demás con polling cada 20 s.
  useEffect(() => {
    const interval = setInterval(() => load(true), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load]);

  const latestRef = useRef({ session, profile, activityState: activity.state, kcal: today.kcalMet });
  latestRef.current = { session, profile, activityState: activity.state, kcal: today.kcalMet };

  const lastSubmitAtRef = useRef(0);
  const lastSubmittedActivityRef = useRef(activity.state);

  // Publica el propio puntaje como máximo cada 15 s si la actividad cambió,
  // o cada 60 s si no, y solo con la app en primer plano.
  useEffect(() => {
    const submitIfDue = () => {
      const { session, profile, activityState, kcal } = latestRef.current;
      if (!session || !profile || AppState.currentState !== 'active') return;

      const now = Date.now();
      const activityChanged = lastSubmittedActivityRef.current !== activityState;
      const minInterval = activityChanged ? SUBMIT_MIN_INTERVAL_MS : SUBMIT_MAX_INTERVAL_MS;
      if (now - lastSubmitAtRef.current < minInterval) return;

      lastSubmitAtRef.current = now;
      lastSubmittedActivityRef.current = activityState;
      rankingService.submitScore({ userId: session.userId, name: profile.name, kcal, activity: activityState });
    };

    submitIfDue();
    const interval = setInterval(submitIfDue, SUBMIT_CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  }, [load]);

  return { entries, isLoading, isRefreshing, refresh };
}

export type { RankingEntry, RankingPeriod };
