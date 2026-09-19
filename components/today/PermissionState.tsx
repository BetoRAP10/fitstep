import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, radius, spacing, fontFamily, fontSize } from '@/theme';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import type { PedometerPermissionStatus } from '@/hooks/usePedometer';

interface PermissionStateProps {
  status: Extract<PedometerPermissionStatus, 'denied' | 'unavailable'>;
  onRetry: () => void;
}

const COPY: Record<PermissionStateProps['status'], { title: string; body: string; icon: keyof typeof Feather.glyphMap }> = {
  denied: {
    title: 'Necesitamos el permiso de movimiento',
    body: 'Sin acceso al sensor de pasos no podemos contar tu actividad. Actívalo en los ajustes del sistema o reintenta aquí.',
    icon: 'activity',
  },
  unavailable: {
    title: 'Este dispositivo no tiene podómetro',
    body: 'No encontramos un sensor de pasos compatible. Puedes activar el modo demo en Perfil para probar la app de todas formas.',
    icon: 'alert-triangle',
  },
};

export function PermissionState({ status, onRetry }: PermissionStateProps) {
  const copy = COPY[status];

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Feather name={copy.icon} size={22} color={colors.textPrimary} />
      </View>
      <Text style={styles.title}>{copy.title}</Text>
      <Text style={styles.body}>{copy.body}</Text>
      {status === 'denied' && (
        <PrimaryButton label="Reintentar" onPress={onRetry} variant="secondary" style={styles.button} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.xxl,
    marginTop: spacing.xxxl,
    padding: spacing.xl,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'flex-start',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fontFamily.textSemiBold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  body: {
    fontFamily: fontFamily.textRegular,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  button: {
    marginTop: spacing.xl,
    alignSelf: 'stretch',
  },
});
