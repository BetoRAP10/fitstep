import { create } from 'zustand';
import { authService, type SignUpInput } from '@/services/auth';
import { useProfileStore } from '@/state/profileStore';
import { getJSON, setJSON, STORAGE_KEYS } from '@/services/storage';
import { isBiometricAvailable } from '@/services/biometrics';

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
  // Bloqueo con Face ID / huella: isUnlocked vive solo en memoria (se reinicia
  // en cada arranque en frío de la app), biometricLockEnabled se persiste.
  isUnlocked: boolean;
  biometricLockEnabled: boolean;
  biometricAvailable: boolean;
  hydrate: () => Promise<void>;
  signUp: (input: SignUpInput) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<boolean>;
  clearError: () => void;
  unlock: () => void;
  setBiometricLockEnabled: (enabled: boolean) => Promise<void>;
}

function readableError(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  isAuthenticated: false,
  isHydrated: false,
  isSubmitting: false,
  error: null,
  isUnlocked: false,
  biometricLockEnabled: false,
  biometricAvailable: false,

  hydrate: async () => {
    const [result, storedLockEnabled, biometricAvailable] = await Promise.all([
      authService.restoreSession(),
      getJSON<boolean>(STORAGE_KEYS.biometricLockEnabled),
      isBiometricAvailable(),
    ]);
    const biometricLockEnabled = Boolean(storedLockEnabled) && biometricAvailable;

    if (result) {
      await useProfileStore.getState().saveProfile(result.profile);
      set({
        session: { userId: result.userId, email: result.email },
        isAuthenticated: true,
        isUnlocked: !biometricLockEnabled,
        biometricLockEnabled,
        biometricAvailable,
        isHydrated: true,
      });
    } else {
      set({ biometricLockEnabled, biometricAvailable, isHydrated: true });
    }
  },

  signUp: async (input) => {
    set({ isSubmitting: true, error: null });
    try {
      const result = await authService.signUp(input);
      await useProfileStore.getState().saveProfile(result.profile);

      // Al registrarse, si el dispositivo soporta Face ID / huella, se activa
      // el bloqueo automáticamente para los próximos accesos.
      const biometricAvailable = await isBiometricAvailable();
      if (biometricAvailable) {
        await setJSON(STORAGE_KEYS.biometricLockEnabled, true);
      }

      set({
        session: { userId: result.userId, email: result.email },
        isAuthenticated: true,
        isUnlocked: true,
        biometricAvailable,
        biometricLockEnabled: biometricAvailable,
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
        isUnlocked: true,
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
    set({ session: null, isAuthenticated: false, isUnlocked: false });
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

  unlock: () => set({ isUnlocked: true }),

  setBiometricLockEnabled: async (enabled: boolean) => {
    const canEnable = enabled && (get().biometricAvailable || (await isBiometricAvailable()));
    await setJSON(STORAGE_KEYS.biometricLockEnabled, canEnable);
    set({ biometricLockEnabled: canEnable, biometricAvailable: get().biometricAvailable || canEnable });
  },
}));
