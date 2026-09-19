import { createContext, useContext, ReactNode } from 'react';
import { useActivity, ActivitySnapshot } from '@/hooks/useActivity';

const ActivityContext = createContext<ActivitySnapshot | null>(null);

// Única suscripción a los sensores de actividad en toda la app. Se monta una
// vez en la raíz de (tabs); Hoy y Ranking leen de aquí con useActivityContext.
export function ActivityProvider({ children }: { children: ReactNode }) {
  const snapshot = useActivity();
  return <ActivityContext.Provider value={snapshot}>{children}</ActivityContext.Provider>;
}

export function useActivityContext(): ActivitySnapshot {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivityContext debe usarse dentro de ActivityProvider');
  }
  return context;
}
