import { useEffect, useRef, useState } from 'react';
import { Accelerometer } from 'expo-sensors';
import { ACTIVITY_THRESHOLDS, type ActivityState } from '@/constants/activity';
import { computeCadence, type StepSample } from '@/utils/cadence';
import { computeRms, type AccelSample } from '@/utils/intensity';
import type { StepEvent } from '@/hooks/usePedometer';

export interface ActivitySnapshot {
  state: ActivityState;
  cadence: number;
}

interface UseActivityOptions {
  lastStepEvent: StepEvent | null;
  enabled: boolean;
}

function classify(cadence: number, secondsSinceLastStep: number, highIntensity: boolean): ActivityState {
  const t = ACTIVITY_THRESHOLDS;
  if (cadence < t.stillCadenceBelow || secondsSinceLastStep >= t.stillNoStepsSeconds) {
    return 'still';
  }
  if (cadence >= t.runningCadenceAbove) return 'running';
  if (cadence >= t.runningHighIntensityCadenceAbove && highIntensity) return 'running';
  return 'walking';
}

// Detección de quieto/caminando/corriendo. Combina la cadencia derivada de
// los pasos con la intensidad del acelerómetro, y solo confirma un cambio de
// estado si se sostiene por ACTIVITY_THRESHOLDS.hysteresisSeconds — evita el
// parpadeo entre estados en cadencias frontera.
export function useActivity({ lastStepEvent, enabled }: UseActivityOptions): ActivitySnapshot {
  const [snapshot, setSnapshot] = useState<ActivitySnapshot>({ state: 'still', cadence: 0 });

  const stepSamplesRef = useRef<StepSample[]>([]);
  const lastStepAtRef = useRef<number | null>(null);
  const accelSamplesRef = useRef<AccelSample[]>([]);
  const committedRef = useRef<ActivityState>('still');
  const candidateRef = useRef<{ state: ActivityState; since: number }>({ state: 'still', since: Date.now() });

  useEffect(() => {
    if (!lastStepEvent) return;
    stepSamplesRef.current.push(lastStepEvent);
    lastStepAtRef.current = lastStepEvent.timestamp;
    const cutoff = lastStepEvent.timestamp - ACTIVITY_THRESHOLDS.cadenceSmoothingSeconds * 1000;
    stepSamplesRef.current = stepSamplesRef.current.filter((s) => s.timestamp >= cutoff);
  }, [lastStepEvent]);

  useEffect(() => {
    if (!enabled) return;

    Accelerometer.setUpdateInterval(ACTIVITY_THRESHOLDS.accelerometerIntervalMs);
    const subscription = Accelerometer.addListener(({ x, y, z }) => {
      const now = Date.now();
      accelSamplesRef.current.push({ x, y, z, timestamp: now });
      const cutoff = now - ACTIVITY_THRESHOLDS.accelerometerWindowSeconds * 1000;
      accelSamplesRef.current = accelSamplesRef.current.filter((s) => s.timestamp >= cutoff);
    });

    return () => subscription.remove();
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      committedRef.current = 'still';
      setSnapshot({ state: 'still', cadence: 0 });
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const cadence = computeCadence(stepSamplesRef.current, now, ACTIVITY_THRESHOLDS.cadenceSmoothingSeconds);
      const secondsSinceLastStep = lastStepAtRef.current ? (now - lastStepAtRef.current) / 1000 : Infinity;
      const rms = computeRms(accelSamplesRef.current, now, ACTIVITY_THRESHOLDS.accelerometerWindowSeconds);
      const highIntensity = rms >= ACTIVITY_THRESHOLDS.highIntensityRmsThreshold;
      const raw = classify(cadence, secondsSinceLastStep, highIntensity);

      if (raw !== candidateRef.current.state) {
        candidateRef.current = { state: raw, since: now };
      }
      const heldForSeconds = (now - candidateRef.current.since) / 1000;
      if (raw !== committedRef.current && heldForSeconds >= ACTIVITY_THRESHOLDS.hysteresisSeconds) {
        committedRef.current = raw;
      }

      setSnapshot({ state: committedRef.current, cadence });
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled]);

  return snapshot;
}
