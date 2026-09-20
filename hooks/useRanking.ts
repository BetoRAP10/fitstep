import { useCallback, useEffect, useState } from 'react';
import { rankingService, type RankingEntry, type RankingPeriod } from '@/services/ranking';
import { useAuth } from '@/hooks/useAuth';

const POLL_INTERVAL_MS = 20_000;

export function useRanking(period: RankingPeriod) {
  const [entries, setEntries] = useState<RankingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { session } = useAuth();

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

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await load();
    setIsRefreshing(false);
  }, [load]);

  return { entries, isLoading, isRefreshing, refresh };
}

export type { RankingEntry, RankingPeriod };
