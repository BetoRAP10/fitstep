import { create } from 'zustand';
import type { Sex } from '@/state/profileStore';
import { DEFAULT_DAILY_GOAL } from '@/state/profileStore';

// Datos en tránsito durante los 3 pasos del registro. Se descartan al terminar
// (la cuenta creada vive en services/auth.ts, el perfil en profileStore).
interface RegistrationDraft {
  name: string;
  email: string;
  password: string;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  dailyGoalSteps: number;
  setAccount: (name: string, email: string, password: string) => void;
  setBodyData: (sex: Sex, age: number, heightCm: number, weightKg: number) => void;
  setDailyGoal: (steps: number) => void;
  reset: () => void;
}

const initial = {
  name: '',
  email: '',
  password: '',
  sex: 'unspecified' as Sex,
  age: 25,
  heightCm: 170,
  weightKg: 70,
  dailyGoalSteps: DEFAULT_DAILY_GOAL,
};

export const useRegistrationDraftStore = create<RegistrationDraft>((set) => ({
  ...initial,
  setAccount: (name, email, password) => set({ name, email, password }),
  setBodyData: (sex, age, heightCm, weightKg) => set({ sex, age, heightCm, weightKg }),
  setDailyGoal: (dailyGoalSteps) => set({ dailyGoalSteps }),
  reset: () => set(initial),
}));
