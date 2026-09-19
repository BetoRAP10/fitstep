import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, fontFamily, fontSize } from '@/theme';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useAuth } from '@/hooks/useAuth';
import { validateEmail } from '@/utils/validation';

export default function Login() {
  const router = useRouter();
  const { signIn, isSubmitting, error, clearError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const emailProblem = validateEmail(email);
    setEmailError(emailProblem);
    if (emailProblem || password.length === 0) return;

    clearError();
    const ok = await signIn(email, password);
    if (ok) {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
            <Feather name="chevron-left" size={24} color={colors.textPrimary} />
          </Pressable>

          <View style={styles.body}>
            <Text style={styles.title}>Iniciar sesión</Text>
            <Text style={styles.subtitle}>Entra con tu correo y contraseña.</Text>

            <View style={styles.form}>
              <AuthTextField
                label="Correo"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError(null);
                  if (error) clearError();
                }}
                placeholder="tucorreo@ejemplo.com"
                error={emailError}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="username"
                returnKeyType="next"
              />
              <AuthTextField
                label="Contraseña"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (error) clearError();
                }}
                placeholder="Tu contraseña"
                secureToggle
                autoComplete="password"
                textContentType="password"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />

              <Pressable onPress={() => router.push('/(auth)/recuperar')} hitSlop={8} style={styles.forgot}>
                <Text style={styles.forgotText}>Olvidé mi contraseña</Text>
              </Pressable>

              {error ? <Text style={styles.serverError}>{error}</Text> : null}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            label={isSubmitting ? 'Entrando…' : 'Iniciar sesión'}
            onPress={handleSubmit}
            disabled={isSubmitting}
          />
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
    paddingBottom: spacing.xl,
  },
  back: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  body: {
    marginTop: spacing.xxxl,
  },
  title: {
    fontFamily: fontFamily.displayBold,
    fontSize: fontSize.displayLg,
    color: colors.textPrimary,
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
  forgot: {
    alignSelf: 'flex-end',
  },
  forgotText: {
    fontFamily: fontFamily.textSemiBold,
    fontSize: fontSize.sm,
    color: colors.accent,
  },
  serverError: {
    fontFamily: fontFamily.textRegular,
    fontSize: fontSize.sm,
    color: colors.danger,
  },
  footer: {
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.lg,
  },
});
