import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import * as Haptics from 'expo-haptics';
import { usePedometer, type PedometerPermissionStatus } from '@/hooks/usePedometer';
import { useActivity, type ActivitySnapshot } from '@/hooks/useActivity';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { useDailyStatsStore } from '@/state/dailyStatsStore';
import { strideLengthMeters, strideCalories, metForCadence, metCaloriesForSeconds } from '@/utils/calories';
import type { Profile } from '@/state/profileStore';
import { useScoreSync } from '@/hooks/useScoreSync';

interface ActivityContextValue extends ActivitySnapshot {
  todaySteps: number;
  permissionStatus: PedometerPermissionStatus;
  requestPermission: () => void;
  goalJustReached: boolean;
}

const ActivityContext = createContext<ActivityContextValue | null>(null);

// Única suscripción a los sensores de actividad en toda la app: monta el
// podómetro, la detección de actividad y la acumulación de calorías/segundos
// una sola vez en la raíz de (tabs). Hoy, Ranking y Perfil solo leen de aquí.
export function ActivityProvider({ children }: { children: ReactNode }) {
  const { profile } = useProfile();
  const { session } = useAuth();
  const userId = session?.userId ?? '';

  const pedometer = usePedometer(userId);
  const activity = useActivity({
    lastStepEvent: pedometer.lastEvent,
    enabled: pedometer.permissionStatus === 'granted',
  });

  const hydrateStats = useDailyStatsStore((s) => s.hydrate);
  const isStatsHydrated = useDailyStatsStore((s) => s.isHydrated);
  const reconcilePedometerSteps = useDailyStatsStore((s) => s.reconcilePedometerSteps);
  const addActiveSeconds = useDailyStatsStore((s) => s.addActiveSeconds);
  const evaluateGoal = useDailyStatsStore((s) => s.evaluateGoal);
  const today = useDailyStatsStore((s) => s.today);

  // Se re-hidrata cada vez que cambia el usuario (no solo la primera vez),
  // para que cambiar de cuenta en el mismo dispositivo traiga sus propios
  // datos en vez de seguir mostrando los de la cuenta anterior.
  useEffect(() => {
    if (userId) hydrateStats(userId);
  }, [userId, hydrateStats]);

  const activityRef = useRef(activity);
  activityRef.current = activity;
  const profileRef = useRef<Profile | null>(profile);
  profileRef.current = profile;

  const lastGoalCheckRef = useRef(0);
  const [goalJustReached, setGoalJustReached] = useState(false);

  // El total del podómetro es la fuente de verdad. Así se recuperan en iOS
  // los pasos registrados mientras la app estaba en segundo plano y tampoco
  // se descartan los primeros pasos durante la histéresis de actividad.
  useEffect(() => {
    const currentProfile = profileRef.current;
    if (!currentProfile || !isStatsHydrated) return;

    const currentActivity = activityRef.current.state === 'running' ? 'running' : 'walking';
    const strideMeters = strideLengthMeters(currentProfile.heightCm, currentActivity, currentProfile.sex);
    const kcalStridePerStep = strideCalories(1, strideMeters, currentProfile.weightKg, currentActivity);
    void reconcilePedometerSteps(pedometer.todaySteps, currentActivity, kcalStridePerStep);
  }, [pedometer.todaySteps, isStatsHydrated, reconcilePedometerSteps]);

  useScoreSync({
    session,
    profile,
    stats: today,
    activity: activity.state,
    enabled: isStatsHydrated,
  });

  // Acumulación MET oficial: cada segundo de actividad suma
  // MET(actividad, cadencia) × peso / 3600 al total del día.
  useEffect(() => {
    const interval = setInterval(() => {
      const currentProfile = profileRef.current;
      const current = activityRef.current;
      if (!currentProfile || current.state === 'still') return;

      const met = metForCadence(current.state, current.cadence);
      const kcalMet = metCaloriesForSeconds(met, currentProfile.weightKg, 1);
      addActiveSeconds(current.state, 1, kcalMet);
    }, 1000);
    return () => clearInterval(interval);
  }, [addActiveSeconds]);

  // Meta diaria: vibra una sola vez por día al cruzarla.
  useEffect(() => {
    const goal = profile?.dailyGoalSteps;
    if (!goal || !isStatsHydrated) return;
    if (Date.now() - lastGoalCheckRef.current < 2000) return;
    lastGoalCheckRef.current = Date.now();

    evaluateGoal(goal).then((justReached) => {
      if (justReached) {
        setGoalJustReached(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTimeout(() => setGoalJustReached(false), 3000);
      }
    });
  }, [pedometer.todaySteps, profile?.dailyGoalSteps, isStatsHydrated, evaluateGoal]);

  const value: ActivityContextValue = {
    ...activity,
    todaySteps: pedometer.todaySteps,
    permissionStatus: pedometer.permissionStatus,
    requestPermission: pedometer.requestPermission,
    goalJustReached,
  };

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
}

export function useActivityContext(): ActivityContextValue {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivityContext debe usarse dentro de ActivityProvider');
  }
  return context;
}
