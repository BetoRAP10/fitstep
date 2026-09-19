import { useEffect } from 'react';
import type { DemoActivity } from '@/state/profileStore';

// Cadencias típicas usadas solo para simular pasos en el modo demo. No tienen
// relación con los umbrales reales de constants/activity.ts.
const DEMO_CADENCE_SPM: Record<'walking' | 'running', number> = {
  walking: 105,
  running: 155,
};
const ALTERNATE_EVERY_MS = 20000;

interface UseDemoStepsOptions {
  enabled: boolean;
  mode: DemoActivity;
  onStep: (delta: number, timestamp: number) => void;
}

// Simula pasos reales (uno por uno, con la cadencia del modo elegido) para
// poder probar la app sin caminar. Completamente aislado de usePedometer:
// solo se conecta cuando el interruptor de modo demo está activo.
export function useDemoSteps({ enabled, mode, onStep }: UseDemoStepsOptions): void {
  useEffect(() => {
    if (!enabled) return;

    let currentMode: 'walking' | 'running' = mode === 'running' ? 'running' : 'walking';
    let stepTimeout: ReturnType<typeof setTimeout>;
    let alternateInterval: ReturnType<typeof setInterval> | null = null;
    let cancelled = false;

    if (mode === 'alternating') {
      alternateInterval = setInterval(() => {
        currentMode = currentMode === 'walking' ? 'running' : 'walking';
      }, ALTERNATE_EVERY_MS);
    }

    const scheduleNextStep = () => {
      const cadence = DEMO_CADENCE_SPM[currentMode];
      const jitter = 0.85 + Math.random() * 0.3;
      const intervalMs = (60 / cadence) * 1000 * jitter;
      stepTimeout = setTimeout(() => {
        if (cancelled) return;
        onStep(1, Date.now());
        scheduleNextStep();
      }, intervalMs);
    };

    scheduleNextStep();

    return () => {
      cancelled = true;
      clearTimeout(stepTimeout);
      if (alternateInterval) clearInterval(alternateInterval);
    };
  }, [enabled, mode, onStep]);
}
