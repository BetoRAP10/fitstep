// Tabla aproximada basada en el Compendio de Actividades Físicas.
// Referencia: caminar moderado ≈ 3.5 MET ≈ 100 pasos/min.
export const WALKING_MET_TABLE: [cadence: number, met: number][] = [
  [80, 2.8],
  [100, 3.5],
  [120, 4.3],
  [130, 5.0],
];

export const RUNNING_MET_TABLE: [cadence: number, met: number][] = [
  [150, 8.3],
  [160, 9.8],
  [170, 11.0],
  [180, 11.8],
];
