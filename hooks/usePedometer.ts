import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { getJSON, setJSON, STORAGE_KEYS } from '@/services/storage';
import { todayKey } from '@/utils/date';

export type PedometerPermissionStatus = 'checking' | 'granted' | 'denied' | 'unavailable';

export interface StepEvent {
  timestamp: number;
  delta: number;
}

interface UsePedometerResult {
  permissionStatus: PedometerPermissionStatus;
  todaySteps: number;
  lastEvent: StepEvent | null;
  requestPermission: () => void;
}

// El conteo de pasos se guarda por usuario (ver services/storage.ts) para
// que dos cuentas en el mismo dispositivo no hereden pasos entre sí.
export function usePedometer(userId: string): UsePedometerResult {
  const [permissionStatus, setPermissionStatus] = useState<PedometerPermissionStatus>('checking');
  const [todaySteps, setTodaySteps] = useState(0);
  const [lastEvent, setLastEvent] = useState<StepEvent | null>(null);

  const dayKeyRef = useRef(todayKey());
  const watchBaselineRef = useRef<number | null>(null);
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  const addSteps = useCallback((delta: number, timestamp: number) => {
    if (delta <= 0) return;
    setTodaySteps((prev) => {
      const next = prev + delta;
      setJSON(STORAGE_KEYS.stepsByDay(userIdRef.current, dayKeyRef.current), next);
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
        setJSON(STORAGE_KEYS.stepsByDay(userIdRef.current, key), 0);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // El permiso es del dispositivo/app, no de la cuenta: se revisa una sola
  // vez por vida de la app, no cada vez que cambia el usuario.
  useEffect(() => {
    let cancelled = false;

    async function checkPermission() {
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
      if (!cancelled) setPermissionStatus(granted ? 'granted' : 'denied');
    }

    checkPermission();
    return () => {
      cancelled = true;
    };
  }, []);

  // Conteo de hoy para ESTE usuario: se recarga si cambia de cuenta en el
  // mismo dispositivo. En iOS, getStepCountAsync devuelve el conteo físico
  // real del teléfono para hoy — es el mismo para cualquier cuenta que se
  // pruebe en ese dispositivo el mismo día, no es posible (ni deseable)
  // separarlo por cuenta ahí. El contador propio (Android, o si falla la
  // API de iOS) sí queda aislado por usuario.
  useEffect(() => {
    if (permissionStatus !== 'granted') return;
    let cancelled = false;

    async function loadTodayForUser() {
      const stored = (await getJSON<number>(STORAGE_KEYS.stepsByDay(userId, dayKeyRef.current))) ?? 0;
      if (cancelled) return;

      if (Platform.OS === 'ios') {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        try {
          const result = await Pedometer.getStepCountAsync(start, new Date());
          if (cancelled) return;
          setTodaySteps(result.steps);
          setJSON(STORAGE_KEYS.stepsByDay(userId, dayKeyRef.current), result.steps);
        } catch {
          if (!cancelled) setTodaySteps(stored);
        }
      } else {
        setTodaySteps(stored);
      }
    }

    loadTodayForUser();
    return () => {
      cancelled = true;
    };
  }, [userId, permissionStatus]);

  // Única suscripción en vivo al sensor real. watchStepCount entrega el total
  // acumulado desde que se empezó a escuchar, no un delta — hay que restar
  // el valor anterior nosotros mismos. No depende del usuario: los pasos que
  // lleguen se atribuyen a quien esté activo en ese momento.
  useEffect(() => {
    if (permissionStatus !== 'granted') return;

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
  }, [permissionStatus, addSteps]);

  const requestPermission = useCallback(() => {
    setPermissionStatus('checking');
    Pedometer.requestPermissionsAsync()
      .then((result) => setPermissionStatus(result.status === 'granted' ? 'granted' : 'denied'))
      .catch(() => setPermissionStatus('denied'));
  }, []);

  return { permissionStatus, todaySteps, lastEvent, requestPermission };
}
