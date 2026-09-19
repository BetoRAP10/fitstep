import { useProfileStore } from '@/state/profileStore';

// Punto de entrada único para pantallas: expone el perfil y sus acciones
// sin acoplar las vistas a la implementación de zustand.
export function useProfile() {
  const profile = useProfileStore((s) => s.profile);
  const isHydrated = useProfileStore((s) => s.isHydrated);
  const saveProfile = useProfileStore((s) => s.saveProfile);
  const updateProfile = useProfileStore((s) => s.updateProfile);

  return { profile, isHydrated, saveProfile, updateProfile };
}
