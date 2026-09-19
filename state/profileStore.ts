import { create } from 'zustand';
import { getJSON, setJSON, STORAGE_KEYS } from '@/services/storage';

export type Sex = 'male' | 'female' | 'unspecified';
export type DemoActivity = 'walking' | 'running' | 'alternating';

export interface Profile {
  name: string;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  dailyGoalSteps: number;
  demoModeEnabled: boolean;
  demoActivity: DemoActivity;
}

export const DEFAULT_DAILY_GOAL = 8000;

interface ProfileState {
  profile: Profile | null;
  isHydrated: boolean;
  hydrate: () => Promise<void>;
  saveProfile: (profile: Omit<Profile, 'demoActivity'> & { demoActivity?: DemoActivity }) => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
  setDemoMode: (enabled: boolean) => Promise<void>;
  setDemoActivity: (activity: DemoActivity) => Promise<void>;
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
    const complete: Profile = { demoActivity: 'walking', ...profile };
    await setJSON(STORAGE_KEYS.profile, complete);
    set({ profile: complete });
  },

  updateProfile: async (patch: Partial<Profile>) => {
    const current = get().profile;
    if (!current) return;
    const next = { ...current, ...patch };
    await setJSON(STORAGE_KEYS.profile, next);
    set({ profile: next });
  },

  setDemoMode: async (enabled: boolean) => {
    await get().updateProfile({ demoModeEnabled: enabled });
  },

  setDemoActivity: async (activity: DemoActivity) => {
    await get().updateProfile({ demoActivity: activity });
  },

  clear: async () => {
    set({ profile: null });
  },
}));
