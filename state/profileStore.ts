import { create } from 'zustand';
import { getJSON, setJSON, removeItem, STORAGE_KEYS } from '@/services/storage';
import { authService } from '@/services/auth';
import { useAuthStore } from '@/state/authStore';

export type Sex = 'male' | 'female' | 'unspecified';

export interface Profile {
  name: string;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  dailyGoalSteps: number;
}

export const DEFAULT_DAILY_GOAL = 8000;

interface ProfileState {
  profile: Profile | null;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  saveProfile: (profile: Profile) => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
  clear: () => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isHydrated: false,

  hydrate: async () => {
    const profile = await getJSON<Profile>(STORAGE_KEYS.profile);
    set({ profile, isHydrated: true });
  },

  saveProfile: async (profile) => {
    await setJSON(STORAGE_KEYS.profile, profile);
    set({ profile });
  },

  updateProfile: async (patch: Partial<Profile>) => {
    const current = get().profile;
    if (!current) return;
    const next = { ...current, ...patch };
    const userId = useAuthStore.getState().session?.userId;
    if (!userId) throw new Error('No hay una sesión activa.');
    const saved = await authService.updateProfile(userId, next);
    await setJSON(STORAGE_KEYS.profile, saved);
    set({ profile: saved });
  },

  clear: async () => {
    await removeItem(STORAGE_KEYS.profile);
    set({ profile: null });
  },
}));
