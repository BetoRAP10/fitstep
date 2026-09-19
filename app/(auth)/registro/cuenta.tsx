import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, fontFamily, fontSize } from '@/theme';
import { ProgressBar } from '@/components/auth/ProgressBar';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useRegistrationDraftStore } from '@/state/registrationDraftStore';
import { validateName, validateEmail, validatePassword } from '@/utils/validation';

export default function RegistroCuenta() {
  const router = useRouter();
  const setAccount = useRegistrationDraftStore((s) => s.setAccount);
  const draft = useRegistrationDraftStore();

  const [name, setName] = useState(draft.name);
  const [email, setEmail] = useState(draft.email);
  const [password, setPassword] = useState(draft.password);
  const [errors, setErrors] = useState<{ name?: string | null; email?: string | null; password?: string | null }>({});

  const handleContinue = () => {
    const nameError = validateName(name);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    setErrors({ name: nameError, email: emailError, password: passwordError });
    if (nameError || emailError || passwordError) return;

    setAccount(name.trim(), email.trim(), password);
    router.push('/(auth)/registro/datos');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
              <Feather name="chevron-left" size={24} color={colors.textPrimary} />
            </Pressable>
            <ProgressBar total={3} current={0} />
          </View>

          <View style={styles.body}>
            <Text style={styles.eyebrow}>Paso 1 de 3</Text>
            <Text style={styles.title}>Crea tu cuenta</Text>
            <Text style={styles.subtitle}>Así vas a identificarte dentro de FitStep.</Text>

            <View style={styles.form}>
              <AuthTextField
                label="Nombre o apodo"
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  if (errors.name) setErrors((e) => ({ ...e, name: null }));
                }}
                placeholder="Cómo te vamos a mostrar"
                error={errors.name}
                autoComplete="name"
                textContentType="name"
                returnKeyType="next"
              />
              <AuthTextField
                label="Correo"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (errors.email) setErrors((e) => ({ ...e, email: null }));
                }}
                placeholder="tucorreo@ejemplo.com"
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
              />
              <AuthTextField
                label="Contraseña"
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (errors.password) setErrors((e) => ({ ...e, password: null }));
                }}
                placeholder="Mínimo 8 caracteres"
                error={errors.password}
                secureToggle
                autoComplete="password-new"
                textContentType="newPassword"
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton label="Continuar" onPress={handleContinue} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  back: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  body: {
    marginTop: spacing.xxxl,
  },
  eyebrow: {
    fontFamily: fontFamily.textSemiBold,
    fontSize: fontSize.sm,
    color: colors.accent,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fontFamily.displayBold,
    fontSize: fontSize.displayLg,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  subtitle: {
    fontFamily: fontFamily.textRegular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  form: {
    marginTop: spacing.xxxl,
    gap: spacing.xl,
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
  },
});
