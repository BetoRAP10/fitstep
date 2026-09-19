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
}

// Única decisión de backend en toda la app: las pantallas y el authStore
// solo conocen AuthService, nunca si hay Supabase configurado o no.
export const authService: AuthService = isSupabaseConfigured ? supabaseAuthService : localAuthService;
export const authBackend: 'supabase' | 'local' = isSupabaseConfigured ? 'supabase' : 'local';
