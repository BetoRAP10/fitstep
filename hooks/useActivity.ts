import { useState } from 'react';
import type { ActivityState } from '@/constants/activity';

export interface ActivitySnapshot {
  state: ActivityState;
  cadence: number;
}

// Stub de fase (a): fija el estado en "quieto" para que la navegación y el
// ActivityProvider puedan construirse ya. La fase (c) reemplaza esto por la
// detección real (Pedometer + Accelerometer + histéresis de 8 s).
export function useActivity(): ActivitySnapshot {
  const [snapshot] = useState<ActivitySnapshot>({ state: 'still', cadence: 0 });
  return snapshot;
}
