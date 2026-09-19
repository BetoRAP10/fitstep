import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { getJSON, setJSON, STORAGE_KEYS } from '@/services/storage';
import { todayKey } from '@/utils/date';
import { useDemoSteps } from '@/hooks/useDemoSteps';
import type { DemoActivity } from '@/state/profileStore';

export type PedometerPermissionStatus = 'checking' | 'granted' | 'denied' | 'unavailable';

export interface StepEvent {
  timestamp: number;
  delta: number;
}

interface UsePedometerOptions {
  demoMode: boolean;
  demoActivity: DemoActivity;
}

interface UsePedometerResult {
  permissionStatus: PedometerPermissionStatus;
  todaySteps: number;
  lastEvent: StepEvent | null;
  requestPermission: () => void;
}

export function usePedometer({ demoMode, demoActivity }: UsePedometerOptions): UsePedometerResult {
  const [permissionStatus, setPermissionStatus] = useState<PedometerPermissionStatus>('checking');
  const [todaySteps, setTodaySteps] = useState(0);
  const [lastEvent, setLastEvent] = useState<StepEvent | null>(null);

  const dayKeyRef = useRef(todayKey());
  const watchBaselineRef = useRef<number | null>(null);

  const addSteps = useCallback((delta: number, timestamp: number) => {
    if (delta <= 0) return;
    setTodaySteps((prev) => {
      const next = prev + delta;
      setJSON(STORAGE_KEYS.stepsByDay(dayKeyRef.current), next);
      return next;
    });
    setLastEvent({ timestamp, delta });
  }, []);

  // Reinicia el contador si la app sigue abierta al cruzar la medianoche.
  useEffect(() => {
    const interval = setInterval(() => {
      const key = todayKey();
      if (key !== dayKeyRef.current) {
        dayKeyRef.current = key;
        watchBaselineRef.current = null;
        setTodaySteps(0);
        setJSON(STORAGE_KEYS.stepsByDay(key), 0);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Permisos + conteo inicial del día. En iOS se recupera con
  // getStepCountAsync desde las 00:00; en Android esa API no existe, así que
  // se parte del contador propio guardado en AsyncStorage.
  useEffect(() => {
    if (demoMode) {
      setPermissionStatus('granted');
      getJSON<number>(STORAGE_KEYS.stepsByDay(dayKeyRef.current)).then((stored) => {
        setTodaySteps(stored ?? 0);
      });
      return;
    }

    let cancelled = false;

    async function bootstrap() {
      setPermissionStatus('checking');
      const available = await Pedometer.isAvailableAsync().catch(() => false);
      if (cancelled) return;
      if (!available) {
        setPermissionStatus('unavailable');
        return;
      }

      const current = await Pedometer.getPermissionsAsync();
      let granted = current.status === 'granted';
      if (!granted && current.canAskAgain !== false) {
        const requested = await Pedometer.requestPermissionsAsync();
        granted = requested.status === 'granted';
      }
      if (cancelled) return;
      if (!granted) {
        setPermissionStatus('denied');
        return;
      }
      setPermissionStatus('granted');

      const stored = (await getJSON<number>(STORAGE_KEYS.stepsByDay(dayKeyRef.current))) ?? 0;

      if (Platform.OS === 'ios') {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        try {
          const result = await Pedometer.getStepCountAsync(start, new Date());
          if (cancelled) return;
          setTodaySteps(result.steps);
          setJSON(STORAGE_KEYS.stepsByDay(dayKeyRef.current), result.steps);
        } catch {
          if (!cancelled) setTodaySteps(stored);
        }
      } else {
        if (!cancelled) setTodaySteps(stored);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, [demoMode]);

  // Única suscripción en vivo al sensor real. watchStepCount entrega el total
  // acumulado desde que se empezó a escuchar, no un delta — hay que restar
  // el valor anterior nosotros mismos.
  useEffect(() => {
    if (demoMode || permissionStatus !== 'granted') return;

    watchBaselineRef.current = null;
    const subscription = Pedometer.watchStepCount((result) => {
      if (watchBaselineRef.current === null) {
        watchBaselineRef.current = result.steps;
        return;
      }
      const delta = result.steps - watchBaselineRef.current;
      watchBaselineRef.current = result.steps;
      addSteps(delta, Date.now());
    });

    return () => subscription.remove();
  }, [demoMode, permissionStatus, addSteps]);

  useDemoSteps({ enabled: demoMode, mode: demoActivity, onStep: addSteps });

  const requestPermission = useCallback(() => {
    setPermissionStatus('checking');
    Pedometer.requestPermissionsAsync()
      .then((result) => setPermissionStatus(result.status === 'granted' ? 'granted' : 'denied'))
      .catch(() => setPermissionStatus('denied'));
  }, []);

  return { permissionStatus, todaySteps, lastEvent, requestPermission };
}
