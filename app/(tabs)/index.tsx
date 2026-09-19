import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontFamily, fontSize } from '@/theme';
import { useProfile } from '@/hooks/useProfile';
import { useActivityContext } from '@/components/providers/ActivityProvider';

export default function HoyScreen() {
  const { profile } = useProfile();
  const activity = useActivityContext();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hola, {profile?.name ?? ''}</Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
      </View>

      <View style={styles.placeholder}>
        <Text style={styles.placeholderTitle}>El anillo de progreso y la detección de actividad llegan en las fases 3 y 4</Text>
        <Text style={styles.placeholderBody}>
          Meta diaria: {profile?.dailyGoalSteps.toLocaleString('es-MX')} pasos. Estado del ActivityProvider: {activity.state}.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.lg,
  },
  greeting: {
    fontFamily: fontFamily.displayBold,
    fontSize: fontSize.displayLg,
    color: colors.textPrimary,
  },
  date: {
    fontFamily: fontFamily.textRegular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textTransform: 'capitalize',
  },
  placeholder: {
    flex: 1,
    marginHorizontal: spacing.xxl,
    marginTop: spacing.xxxl,
    padding: spacing.xl,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  placeholderTitle: {
    fontFamily: fontFamily.textSemiBold,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
  },
  placeholderBody: {
    fontFamily: fontFamily.textRegular,
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
