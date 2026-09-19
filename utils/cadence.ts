export interface StepSample {
  timestamp: number;
  delta: number;
}

/** Cadencia (pasos/min) estimada con los pasos de los últimos
 * `smoothingSeconds`. iOS entrega watchStepCount por lotes, así que una
 * ventana corta parpadearía; se promedia sobre 30 s por defecto. */
export function computeCadence(samples: StepSample[], now: number, smoothingSeconds: number): number {
  const cutoff = now - smoothingSeconds * 1000;
  const totalSteps = samples.reduce((sum, s) => (s.timestamp >= cutoff ? sum + s.delta : sum), 0);
  if (totalSteps <= 0) return 0;
  return (totalSteps / smoothingSeconds) * 60;
}
