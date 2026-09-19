import { useAuthStore } from '@/state/authStore';

export function useAuth() {
  const session = useAuthStore((s) => s.session);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const isSubmitting = useAuthStore((s) => s.isSubmitting);
  const error = useAuthStore((s) => s.error);
  const signUp = useAuthStore((s) => s.signUp);
  const signIn = useAuthStore((s) => s.signIn);
  const signOut = useAuthStore((s) => s.signOut);
  const requestPasswordReset = useAuthStore((s) => s.requestPasswordReset);
  const clearError = useAuthStore((s) => s.clearError);
  const isUnlocked = useAuthStore((s) => s.isUnlocked);
  const biometricLockEnabled = useAuthStore((s) => s.biometricLockEnabled);
  const biometricAvailable = useAuthStore((s) => s.biometricAvailable);
  const unlock = useAuthStore((s) => s.unlock);
  const setBiometricLockEnabled = useAuthStore((s) => s.setBiometricLockEnabled);

  return {
    session,
    isAuthenticated,
    isHydrated,
    isSubmitting,
    error,
    signUp,
    signIn,
    signOut,
    requestPasswordReset,
    clearError,
    isUnlocked,
    biometricLockEnabled,
    biometricAvailable,
    unlock,
    setBiometricLockEnabled,
  };
}
