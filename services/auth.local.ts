import * as Crypto from 'expo-crypto';
import { getJSON, setJSON, STORAGE_KEYS } from './storage';
import type { AuthService, AuthResult, SignUpInput } from './auth';
import type { Profile } from '@/state/profileStore';

interface LocalAccount {
  id: string;
  email: string;
  passwordHash: string;
  profile: Profile;
}

interface LocalSession {
  userId: string;
  email: string;
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Hash simple para poder demostrar la app sin backend. No sustituye un
// esquema de autenticación de producción (sin salt por usuario).
async function hashPassword(password: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);
}

async function loadAccounts(): Promise<LocalAccount[]> {
  return (await getJSON<LocalAccount[]>(STORAGE_KEYS.localAccounts)) ?? [];
}

export const localAuthService: AuthService = {
  async signUp(input: SignUpInput): Promise<AuthResult> {
    const email = normalizeEmail(input.email);
    const accounts = await loadAccounts();
    if (accounts.some((account) => account.email === email)) {
      throw new Error('Ya existe una cuenta con ese correo.');
    }

    const profile: Profile = {
      name: input.name,
      sex: input.sex,
      age: input.age,
      heightCm: input.heightCm,
      weightKg: input.weightKg,
      dailyGoalSteps: input.dailyGoalSteps,
      demoModeEnabled: false,
      demoActivity: 'walking',
    };
    const account: LocalAccount = {
      id: `local-${Date.now()}`,
      email,
      passwordHash: await hashPassword(input.password),
      profile,
    };

    await setJSON(STORAGE_KEYS.localAccounts, [...accounts, account]);
    await setJSON<LocalSession>(STORAGE_KEYS.localSession, { userId: account.id, email });
    return { userId: account.id, email, profile };
  },

  async signIn(email: string, password: string): Promise<AuthResult> {
    const normalized = normalizeEmail(email);
    const accounts = await loadAccounts();
    const account = accounts.find((a) => a.email === normalized);
    if (!account) {
      throw new Error('No encontramos una cuenta con ese correo.');
    }
    if ((await hashPassword(password)) !== account.passwordHash) {
      throw new Error('La contraseña no es correcta.');
    }

    await setJSON<LocalSession>(STORAGE_KEYS.localSession, { userId: account.id, email: account.email });
    return { userId: account.id, email: account.email, profile: account.profile };
  },

  async signOut(): Promise<void> {
    await setJSON(STORAGE_KEYS.localSession, null);
  },

  async requestPasswordReset(): Promise<void> {
    // Sin backend no hay forma de enviar un correo real. Se resuelve en
    // silencio a propósito, igual que haría Supabase, para no revelar si
    // el correo existe.
  },

  async restoreSession(): Promise<AuthResult | null> {
    const session = await getJSON<LocalSession>(STORAGE_KEYS.localSession);
    if (!session) return null;
    const accounts = await loadAccounts();
    const account = accounts.find((a) => a.id === session.userId);
    if (!account) return null;
    return { userId: account.id, email: account.email, profile: account.profile };
  },
};
