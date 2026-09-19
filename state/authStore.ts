import { create } from 'zustand';
import { authService, type SignUpInput } from '@/services/auth';
import { useProfileStore } from '@/state/profileStore';

export interface Session {
  userId: string;
  email: string;
}

interface AuthState {
  session: Session | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  isSubmitting: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  signUp: (input: SignUpInput) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  clearError: () => void;
}

function readableError(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isAuthenticated: false,
  isHydrated: false,
  isSubmitting: false,
  error: null,

  hydrate: async () => {
    const result = await authService.restoreSession();
    if (result) {
      await useProfileStore.getState().saveProfile(result.profile);
      set({ session: { userId: result.userId, email: result.email }, isAuthenticated: true, isHydrated: true });
    } else {
      set({ isHydrated: true });
    }
  },

  signUp: async (input) => {
    set({ isSubmitting: true, error: null });
    try {
      const result = await authService.signUp(input);
      await useProfileStore.getState().saveProfile(result.profile);
      set({
        session: { userId: result.userId, email: result.email },
        isAuthenticated: true,
        isSubmitting: false,
      });
      return true;
    } catch (error) {
      set({ isSubmitting: false, error: readableError(error, 'No se pudo crear la cuenta.') });
      return false;
    }
  },

  signIn: async (email, password) => {
    set({ isSubmitting: true, error: null });
    try {
      const result = await authService.signIn(email, password);
      await useProfileStore.getState().saveProfile(result.profile);
      set({
        session: { userId: result.userId, email: result.email },
        isAuthenticated: true,
        isSubmitting: false,
      });
      return true;
    } catch (error) {
      set({ isSubmitting: false, error: readableError(error, 'No se pudo iniciar sesión.') });
      return false;
    }
  },

  signOut: async () => {
    await authService.signOut();
    await useProfileStore.getState().clear();
    set({ session: null, isAuthenticated: false });
  },

  requestPasswordReset: async (email) => {
    set({ isSubmitting: true, error: null });
    try {
      await authService.requestPasswordReset(email);
      set({ isSubmitting: false });
      return true;
    } catch (error) {
      set({ isSubmitting: false, error: readableError(error, 'No se pudo procesar la solicitud.') });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
