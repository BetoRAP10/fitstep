import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import * as Haptics from 'expo-haptics';
import { usePedometer, type PedometerPermissionStatus } from '@/hooks/usePedometer';
import { useActivity, type ActivitySnapshot } from '@/hooks/useActivity';
import { useProfile } from '@/hooks/useProfile';
import { useDailyStatsStore } from '@/state/dailyStatsStore';
import { strideLengthMeters, strideCalories, metForCadence, metCaloriesForSeconds } from '@/utils/calories';
import type { Profile } from '@/state/profileStore';

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
  const demoMode = profile?.demoModeEnabled ?? false;
  const demoActivity = profile?.demoActivity ?? 'walking';

  const pedometer = usePedometer({ demoMode, demoActivity });
  const activity = useActivity({
    lastStepEvent: pedometer.lastEvent,
    enabled: pedometer.permissionStatus === 'granted',
  });

  const hydrateStats = useDailyStatsStore((s) => s.hydrate);
  const isStatsHydrated = useDailyStatsStore((s) => s.isHydrated);
  const addSteps = useDailyStatsStore((s) => s.addSteps);
  const addActiveSeconds = useDailyStatsStore((s) => s.addActiveSeconds);
  const evaluateGoal = useDailyStatsStore((s) => s.evaluateGoal);

  useEffect(() => {
    if (!isStatsHydrated) hydrateStats();
  }, [isStatsHydrated, hydrateStats]);

  const activityRef = useRef(activity);
  activityRef.current = activity;
  const profileRef = useRef<Profile | null>(profile);
  profileRef.current = profile;

  const lastGoalCheckRef = useRef(0);
  const [goalJustReached, setGoalJustReached] = useState(false);

  // Atribuye cada lote de pasos entrantes a la actividad vigente en ese
  // instante (así el desglose caminando/corriendo refleja lo que de verdad
  // ocurrió, no solo el estado actual al momento de leer la pantalla).
  useEffect(() => {
    const event = pedometer.lastEvent;
    const currentProfile = profileRef.current;
    if (!event || event.delta <= 0 || !currentProfile) return;

    const currentActivity = activityRef.current.state;
    if (currentActivity === 'still') return;

    const strideMeters = strideLengthMeters(currentProfile.heightCm, currentActivity, currentProfile.sex);
    const kcalStride = strideCalories(event.delta, strideMeters, currentProfile.weightKg, currentActivity);
    addSteps(currentActivity, event.delta, kcalStride);
  }, [pedometer.lastEvent, addSteps]);

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
