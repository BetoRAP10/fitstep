import { supabase } from './supabaseClient';
import type { AuthService, AuthResult, SignUpInput } from './auth';
import type { Profile } from '@/state/profileStore';

interface ProfileRow {
  id: string;
  display_name: string;
  sex: Profile['sex'];
  age: number;
  height_cm: number;
  weight_kg: number;
  daily_goal: number;
}

function rowToProfile(row: ProfileRow): Profile {
  return {
    name: row.display_name,
    sex: row.sex,
    age: row.age,
    heightCm: row.height_cm,
    weightKg: row.weight_kg,
    dailyGoalSteps: row.daily_goal,
    demoModeEnabled: false,
    demoActivity: 'walking',
  };
}

function translateAuthError(message: string): string {
  if (/already registered|already exists/i.test(message)) {
    return 'Ya existe una cuenta con ese correo.';
  }
  if (/invalid login credentials/i.test(message)) {
    return 'Correo o contraseña incorrectos.';
  }
  if (/password/i.test(message)) {
    return 'La contraseña debe tener al menos 8 caracteres.';
  }
  if (/rate limit/i.test(message)) {
    return 'Se enviaron demasiados correos en poco tiempo. Espera unos minutos e intenta de nuevo.';
  }
  return 'Ocurrió un problema. Intenta de nuevo.';
}

export const supabaseAuthService: AuthService = {
  async signUp(input: SignUpInput): Promise<AuthResult> {
    if (!supabase) throw new Error('Supabase no está configurado.');

    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
    });
    if (error) throw new Error(translateAuthError(error.message));

    const user = data.user;
    if (!user) {
      throw new Error('Revisa tu correo para confirmar la cuenta y luego inicia sesión.');
    }

    const profileRow: ProfileRow = {
      id: user.id,
      display_name: input.name,
      sex: input.sex,
      age: input.age,
      height_cm: input.heightCm,
      weight_kg: input.weightKg,
      daily_goal: input.dailyGoalSteps,
    };
    const { error: profileError } = await supabase.from('profiles').upsert(profileRow);
    if (profileError) {
      throw new Error('Tu cuenta se creó, pero no pudimos guardar tu perfil. Intenta iniciar sesión.');
    }

    return { userId: user.id, email: user.email ?? input.email, profile: rowToProfile(profileRow) };
  },

  async signIn(email: string, password: string): Promise<AuthResult> {
    if (!supabase) throw new Error('Supabase no está configurado.');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(translateAuthError(error.message));

    const user = data.user;
    const { data: profileRow, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (profileError || !profileRow) {
      throw new Error('No pudimos cargar tu perfil.');
    }

    return { userId: user.id, email: user.email ?? email, profile: rowToProfile(profileRow as ProfileRow) };
  },

  async signOut(): Promise<void> {
    if (!supabase) return;
    await supabase.auth.signOut();
  },

  async requestPasswordReset(email: string): Promise<void> {
    if (!supabase) return;
    await supabase.auth.resetPasswordForEmail(email);
  },

  async restoreSession(): Promise<AuthResult | null> {
    if (!supabase) return null;

    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (!user) return null;

    const { data: profileRow, error } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (error || !profileRow) return null;

    return { userId: user.id, email: user.email ?? '', profile: rowToProfile(profileRow as ProfileRow) };
  },
};
