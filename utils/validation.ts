const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateName(name: string): string | null {
  if (!name.trim()) return 'Cuéntanos cómo te llamas.';
  if (name.trim().length < 2) return 'Usa al menos 2 caracteres.';
  return null;
}

export function validateEmail(email: string): string | null {
  if (!email.trim()) return 'Ingresa tu correo.';
  if (!EMAIL_RE.test(email.trim())) return 'Ese correo no parece válido.';
  return null;
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  return null;
}

export function validateAge(age: number): string | null {
  if (age < 10 || age > 100) return 'La edad debe estar entre 10 y 100 años.';
  return null;
}

export function validateHeight(heightCm: number): string | null {
  if (heightCm < 120 || heightCm > 230) return 'La estatura debe estar entre 120 y 230 cm.';
  return null;
}

export function validateWeight(weightKg: number): string | null {
  if (weightKg < 30 || weightKg > 250) return 'El peso debe estar entre 30 y 250 kg.';
  return null;
}
