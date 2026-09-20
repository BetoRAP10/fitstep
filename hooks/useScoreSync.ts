import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { rankingService } from '@/services/ranking';
import type { Session } from '@/state/authStore';
import type { Profile } from '@/state/profileStore';
import type { DailyStats } from '@/state/dailyStatsStore';
import type { ActivityState } from '@/constants/activity';

const CHECK_INTERVAL_MS = 5_000;
const MIN_SYNC_INTERVAL_MS = 15_000;
const MAX_SYNC_INTERVAL_MS = 60_000;

interface ScoreSyncOptions {
  session: Session | null;
  profile: Profile | null;
  stats: DailyStats;
  activity: ActivityState;
  enabled: boolean;
}

// Sincroniza desde el proveedor global, no desde la pantalla Ranking: así la
// actividad llega al backend aunque el usuario nunca abra esa pestaña.
export function useScoreSync({ session, profile, stats, activity, enabled }: ScoreSyncOptions): void {
  const latestRef = useRef({ session, profile, stats, activity, enabled });
  latestRef.current = { session, profile, stats, activity, enabled };
  const lastSyncedRef = useRef(0);
  const lastActivityRef = useRef<ActivityState>(activity);
  const isSyncingRef = useRef(false);

  useEffect(() => {
    lastSyncedRef.current = 0;
    lastActivityRef.current = activity;
  }, [session?.userId, stats.date]);

  useEffect(() => {
    const syncIfDue = async () => {
      const current = latestRef.current;
      if (!current.enabled || !current.session || !current.profile || AppState.currentState !== 'active') return;
      if (isSyncingRef.current) return;

      const now = Date.now();
      const activityChanged = lastActivityRef.current !== current.activity;
      const interval = activityChanged ? MIN_SYNC_INTERVAL_MS : MAX_SYNC_INTERVAL_MS;
      if (now - lastSyncedRef.current < interval) return;

      isSyncingRef.current = true;
      try {
        await rankingService.submitScore({
          userId: current.session.userId,
          name: current.profile.name,
          activity: current.activity,
          stats: current.stats,
        });
        lastSyncedRef.current = Date.now();
        lastActivityRef.current = current.activity;
      } catch {
        // No adelantamos el reloj: el siguiente ciclo reintentará el envío.
      } finally {
        isSyncingRef.current = false;
      }
    };

    void syncIfDue();
    const interval = setInterval(() => void syncIfDue(), CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);
}
