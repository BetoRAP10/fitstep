import { Pressable, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { colors, radius, spacing, fontFamily, fontSize } from '@/theme';

export function CaloriesInfoCard() {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push('/calorias-detalle')}
    >
      <View style={styles.iconWrap}>
        <Feather name="pie-chart" size={18} color={colors.accent} />
      </View>
      <View style={styles.copy}>
        <Text style={styles.title}>Cómo se calculan tus calorías</Text>
        <Text style={styles.subtitle}>Comparamos dos métodos y te mostramos la diferencia.</Text>
      </View>
      <Feather name="chevron-right" size={20} color={colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPressed: {
    backgroundColor: colors.surfaceElevated,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
  },
  title: {
    fontFamily: fontFamily.textSemiBold,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
  },
  subtitle: {
    fontFamily: fontFamily.textRegular,
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
});
