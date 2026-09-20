import type { Profile, Sex } from '@/state/profileStore';
import { isSupabaseConfigured } from './supabaseClient';
import { localAuthService } from './auth.local';
import { supabaseAuthService } from './auth.supabase';

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  dailyGoalSteps: number;
}

export interface AuthResult {
  userId: string;
  email: string;
  profile: Profile;
}

export interface AuthService {
  signUp(input: SignUpInput): Promise<AuthResult>;
  signIn(email: string, password: string): Promise<AuthResult>;
  signOut(): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  restoreSession(): Promise<AuthResult | null>;
  updateProfile(userId: string, profile: Profile): Promise<Profile>;
}

export const isLocalDemoEnabled = process.env.EXPO_PUBLIC_ALLOW_LOCAL_DEMO === 'true';

const unavailableAuthService: AuthService = {
  async signUp() { throw new Error('Configura Supabase para crear una cuenta.'); },
  async signIn() { throw new Error('Configura Supabase para iniciar sesión.'); },
  async signOut() {},
  async requestPasswordReset() { throw new Error('Configura Supabase para recuperar la contraseña.'); },
  async restoreSession() { return null; },
  async updateProfile(_userId, profile) { return profile; },
};

export const authService: AuthService = isSupabaseConfigured
  ? supabaseAuthService
  : isLocalDemoEnabled
    ? localAuthService
    : unavailableAuthService;
export const authBackend: 'supabase' | 'local-demo' | 'unconfigured' = isSupabaseConfigured
  ? 'supabase'
  : isLocalDemoEnabled
    ? 'local-demo'
    : 'unconfigured';
