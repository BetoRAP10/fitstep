import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, fontFamily, fontSize } from '@/theme';
import { AuthTextField } from '@/components/auth/AuthTextField';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { useAuth } from '@/hooks/useAuth';
import { validateEmail } from '@/utils/validation';

export default function Recuperar() {
  const router = useRouter();
  const { requestPasswordReset, isSubmitting } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    const problem = validateEmail(email);
    setEmailError(problem);
    if (problem) return;
    await requestPasswordReset(email);
    setSent(true);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.content}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.back}>
            <Feather name="chevron-left" size={24} color={colors.textPrimary} />
          </Pressable>

          <View style={styles.body}>
            <Text style={styles.title}>Recupera tu acceso</Text>
            <Text style={styles.subtitle}>Te enviamos instrucciones si el correo tiene una cuenta.</Text>

            {sent ? (
              <View style={styles.confirmation}>
                <Feather name="check-circle" size={20} color={colors.accent} />
                <Text style={styles.confirmationText}>
                  Si {email.trim()} está registrado, llegarán instrucciones en unos minutos.
                </Text>
              </View>
            ) : (
              <View style={styles.form}>
                <AuthTextField
                  label="Correo"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (emailError) setEmailError(null);
                  }}
                  placeholder="tucorreo@ejemplo.com"
                  error={emailError}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="username"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
              </View>
            )}
          </View>

          {!sent && (
            <PrimaryButton
              label={isSubmitting ? 'Enviando…' : 'Enviar instrucciones'}
              onPress={handleSubmit}
              disabled={isSubmitting}
            />
          )}
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
  content: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    justifyContent: 'space-between',
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
  },
  confirmation: {
    marginTop: spacing.xxxl,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  confirmationText: {
    flex: 1,
    fontFamily: fontFamily.textRegular,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
});
