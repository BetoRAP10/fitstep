export interface AccelSample {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

/** RMS de la magnitud del acelerómetro en una ventana móvil, restando la
 * componente constante de la gravedad (se mide la desviación respecto a la
 * media, no la magnitud absoluta). Correr produce un RMS notablemente mayor
 * que caminar. */
export function computeRms(samples: AccelSample[], now: number, windowSeconds: number): number {
  const cutoff = now - windowSeconds * 1000;
  const relevant = samples.filter((s) => s.timestamp >= cutoff);
  if (relevant.length === 0) return 0;

  const magnitudes = relevant.map((s) => Math.sqrt(s.x * s.x + s.y * s.y + s.z * s.z));
  const mean = magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length;
  const variance = magnitudes.reduce((a, b) => a + (b - mean) ** 2, 0) / magnitudes.length;
  return Math.sqrt(variance);
}
